import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminInitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';
import { serialize } from 'cookie';

// Función para calcular el SECRET_HASH
function calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
    return crypto
        .createHmac("sha256", clientSecret)
        .update(username + clientId)
        .digest("base64");
}

// La clave secreta compartida entre TCV y tu aplicación
const secretKey = 'miClaveSuperSecreta';
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

// Configuración de Cognito
const CLIENT_ID = "1jue84fm6h82gp1s14h790lrvr";
const CLIENT_SECRET = "14pf6v4qd55tnst5911ugdptq97rqo55njl84s0tnrqjg6b4cok2";
const DEFAULT_PASSWORD = "Temporal123!"; // Cambia esto por una contraseña segura
const USER_POOL_ID = "us-east-1_oYRR6lRjG"; // Tu User Pool ID

// Función para registrar o autenticar al usuario en Cognito
async function registerOrLoginUser(
    email: string,
    name: string,
    idcliente: string,
    idsubcli: string,
    tcvUserId: string
): Promise<{ idToken: string; userInfo: Record<string, any> }> {
    if (!email || !name || !idcliente || !idsubcli || !tcvUserId) {
        throw new Error("Todos los parámetros son obligatorios.");
    }

    try {
        // Intentar registrar al usuario en Cognito
        console.log(`Intentando registrar al usuario: ${email}`);
        const createUserCommand = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: [
                { Name: "name", Value: name },
                { Name: "custom:idcliente", Value: idcliente },
                { Name: "custom:idsubcli", Value: idsubcli },
                { Name: "custom:tcv_user_id", Value: tcvUserId },
            ],
        });
        await cognitoClient.send(createUserCommand);

        // Configurar contraseña predeterminada
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
            Password: DEFAULT_PASSWORD,
            Permanent: true,
        });
        await cognitoClient.send(setPasswordCommand);
        console.log(`Contraseña configurada para el usuario: ${email}`);
    } catch (err: any) {
        if (err.name !== "UsernameExistsException") {
            console.error("Error al registrar al usuario:", err);
            throw new Error(`Error al registrar al usuario: ${err.message}`);
        }
    }

    // Calcular SECRET_HASH
    const secretHash = calculateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

    try {
        // Autenticar al usuario y obtener un token
        const authCommand = new AdminInitiateAuthCommand({
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: DEFAULT_PASSWORD,
                SECRET_HASH: secretHash,
            },
        });
        const authResult = await cognitoClient.send(authCommand);
        const idToken = authResult.AuthenticationResult?.IdToken;

        if (!idToken) {
            throw new Error("No se recibió un IdToken después de la autenticación.");
        }

        // Decodificar el token y extraer información del usuario
        const decodedToken = jwt.decode(idToken) as Record<string, any>;
        const userInfo = {
            email: decodedToken.email,
            name: decodedToken.name,
            idcliente: decodedToken["custom:idcliente"],
            idsubcli: decodedToken["custom:idsubcli"],
            tcvUserId: decodedToken["custom:tcv_user_id"],
        };

        return { idToken, userInfo };
    } catch (err: any) {
        console.error("Error al autenticar al usuario:", err);
        throw new Error(`Error al autenticar al usuario: ${err.message}`);
    }
}

// Controlador principal para manejar la solicitud de SSO
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token no proporcionado o inválido' });
    }

    try {
        // Validar y decodificar el token JWT firmado por TCV
        const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] }) as Record<string, any>;
        const { email, name, idcliente, idsubcli, id } = decoded;

        // Validar campos requeridos en el token
        if (!email || !name || !idcliente || !idsubcli || !id) {
            console.error('Token inválido: faltan campos requeridos.');
            return res.status(400).json({ error: 'El token no contiene los campos requeridos' });
        }

        // Registrar o autenticar al usuario en Cognito
        const sessionToken = await registerOrLoginUser(email, name, idcliente, idsubcli, id);
        if (!sessionToken) {
            console.error('Error: No se generó un token de sesión.');
            return res.status(500).json({ error: 'No se pudo generar el token de sesión' });
        }

        console.log('Sesión iniciada con éxito:', sessionToken);

        // Guardar el token en una cookie
        res.setHeader('Set-Cookie', serialize('idToken', sessionToken.idToken, {
            httpOnly: false,  // Eliminar esta línea si quieres acceder a la cookie en JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 día
            path: '/',
        }));        
        

        // Redirigir al dashboard
        return res.redirect('http://localhost:3000/dashboard');
    } catch (err) {
        console.error('Error al procesar SSO:', err);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
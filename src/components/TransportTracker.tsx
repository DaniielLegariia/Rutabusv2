import React, { useState } from 'react';
import { RoutesManagement } from './RoutesManagement';
import { StopsManagement } from './StopsManagement';

interface User {
  idcliente: number;
}

interface TransportTrackerProps {
  user: User;
  activeSection?: 'routes' | 'stops';
}

export const TransportTracker: React.FC<TransportTrackerProps> = ({ user, activeSection = 'routes' }) => {
  const [groupingType, setGroupingType] = useState<'destination' | 'origin' | 'none'>('none');

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      {activeSection === 'routes' && (
        <RoutesManagement 
          idcliente={user.idcliente}
          groupingType={groupingType}
          onGroupingTypeChange={setGroupingType}
        />
      )}

      {activeSection === 'stops' && (
        <StopsManagement idcliente={user.idcliente} />
      )}
    </div>
  );
}; 
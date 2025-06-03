import React from 'react';
import { RoutesSection } from './RoutesSection';

interface RoutesManagementProps {
  idcliente: number;
  groupingType: 'destination' | 'origin' | 'none';
  onGroupingTypeChange: (type: 'destination' | 'origin' | 'none') => void;
}

export const RoutesManagement: React.FC<RoutesManagementProps> = ({
  idcliente,
  groupingType,
  onGroupingTypeChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <RoutesSection 
        idcliente={idcliente} 
        groupingType={groupingType}
        setGroupingType={onGroupingTypeChange}
      />
    </div>
  );
}; 
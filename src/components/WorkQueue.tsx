import React from 'react';
import { Complaint, User } from '../types';
import { StaffDesk } from './StaffDesk';
import { HeadCommandCenter } from './HeadCommandCenter';

interface WorkQueueProps {
  currentUser: User;
  allComplaints: Complaint[];
  allUsers?: User[];
  onSelectComplaint: (cid: string) => void;
  onRefreshComplaints?: () => void;
  onOpenScanner?: () => void;
}

export const WorkQueue: React.FC<WorkQueueProps> = ({
  currentUser,
  allComplaints,
  allUsers = [],
  onSelectComplaint,
  onRefreshComplaints,
  onOpenScanner,
}) => {
  if (currentUser.role === 'staff') {
    return (
      <StaffDesk
        currentUser={currentUser}
        allComplaints={allComplaints}
        onSelectComplaint={onSelectComplaint}
        onRefreshComplaints={onRefreshComplaints}
        onOpenScanner={onOpenScanner}
      />
    );
  }

  return (
    <HeadCommandCenter
      currentUser={currentUser}
      allComplaints={allComplaints}
      allUsers={allUsers}
      onSelectComplaint={onSelectComplaint}
      onRefreshComplaints={onRefreshComplaints}
      onOpenScanner={onOpenScanner}
    />
  );
};

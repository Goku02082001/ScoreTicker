// ExampleComponent.jsx
import React from 'react';
import Badge from './Badge';

const ExampleComponent = () => {
  return (
    <div>
      <h2>Notifications</h2>
      <Badge className="notification-badge" variant="primary">New Messages</Badge>
      <Badge className="notification-badge" variant="secondary">Updates Available</Badge>
    </div>
  );
};

export default ExampleComponent;

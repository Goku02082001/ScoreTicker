// Table.jsx
import React from 'react';

const Table = ({ children, className }) => {
  return (
    <table className={`table ${className}`}>
      {children}
    </table>
  );
};

const TableBody = ({ children, className }) => {
  return <tbody className={`table-body ${className}`}>{children}</tbody>;
};

const TableCell = ({ children, className }) => {
  return <td className={`table-cell ${className}`}>{children}</td>;
};

const TableHead = ({ children, className }) => {
  return <thead className={`table-head ${className}`}>{children}</thead>;
};

const TableHeader = ({ children, className }) => {
  return <th className={`table-header ${className}`}>{children}</th>;
};

const TableRow = ({ children, className }) => {
  return <tr className={`table-row ${className}`}>{children}</tr>;
};

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };

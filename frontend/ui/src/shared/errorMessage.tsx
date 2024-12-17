import React from 'react';

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex items-center">
            <p className="text-red-700">{message}</p>
        </div>
    </div>
);
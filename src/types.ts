import React from 'react';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface ServiceItem {
  title: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
}

export interface DoctorProfile {
  name: string;
  title: string;
  description: string;
  image: string;
}
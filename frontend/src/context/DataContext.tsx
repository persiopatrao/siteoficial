import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface School {
  id: number;
  nome: string;
}

export interface Occurrence {
  id: number;
  aluno: string;
  turma: string;
  descricao: string;
  data: string;
  hora: string;
  empresa_id: number;
  created_by: number;
  created_at?: string;
  status?: 'pending' | 'approved' | 'aprovado';
}

export interface DataContextType {
  schools: School[];
  occurrences: Occurrence[];
  loading: boolean;
  refreshSchools: () => Promise<void>;
  refreshOccurrences: () => Promise<void>;
  createOccurrence: (data: Omit<Occurrence, 'id' | 'empresa_id' | 'created_by'>) => Promise<void>;
  createSchool: (name: string) => Promise<void>;
}

import API_URL from '../api';
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSchools = async () => {
    try {
      const response = await fetch(`${API_URL}/api/empresas`);
      if (response.ok) {
        setSchools(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch schools', error);
    }
  };

  const refreshOccurrences = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOccurrences(Array.isArray(data) ? data : data.incidents || []);
      }
    } catch (error) {
      console.error('Failed to fetch occurrences', error);
    } finally {
      setLoading(false);
    }
  };

  const createOccurrence = async (data: Omit<Occurrence, 'id' | 'empresa_id' | 'created_by'>) => {
    if (!token) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create occurrence');
      await refreshOccurrences();
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (name: string) => {
    if (!token) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/empresas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: name }),
      });
      if (!response.ok) throw new Error('Failed to create school');
      await refreshSchools();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSchools = async () => {
      await refreshSchools();
    };
    loadSchools();
  }, []);

  useEffect(() => {
    const loadOccurrences = async () => {
      if (token) {
        await refreshOccurrences();
      }
    };
    loadOccurrences();
  }, [token]);

  return (
    <DataContext.Provider
      value={{
        schools,
        occurrences,
        loading,
        refreshSchools,
        refreshOccurrences,
        createOccurrence,
        createSchool,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CitizenProfile, Grievance, WelfareScheme, RtiRequest, CircularDoc } from '../types';
import { INITIAL_CITIZENS, INITIAL_GRIEVANCES, WELFARE_SCHEMES, INITIAL_RTI_REQUESTS, OFFICIAL_CIRCULARS } from '../services/dummyData';
import { useAuth } from './AuthContext';

interface CitizenContextType {
  currentCitizen: CitizenProfile;
  allCitizens: CitizenProfile[];
  switchCitizen: (citizenId: string) => void;
  updateCitizenProfile: (profile: Partial<CitizenProfile>) => Promise<void>;
  grievances: Grievance[];
  addGrievance: (grievance: Grievance) => void;
  schemes: WelfareScheme[];
  appliedSchemeIds: string[];
  applyForScheme: (schemeId: string) => void;
  rtiRequests: RtiRequest[];
  addRtiRequest: (request: RtiRequest) => void;
  circulars: CircularDoc[];
  activeView: 'dashboard' | 'schemes' | 'grievances' | 'documents' | 'rti-assistant';
  setActiveView: (view: 'dashboard' | 'schemes' | 'grievances' | 'documents' | 'rti-assistant') => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  isSavingProfile: boolean;
}

const CitizenContext = createContext<CitizenContextType | undefined>(undefined);

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile: authProfile, updateProfileAttributes, quickLoginPreset } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [allCitizens, setAllCitizens] = useState<CitizenProfile[]>(() => {
    const saved = localStorage.getItem('jansetu_citizens');
    return saved ? JSON.parse(saved) : INITIAL_CITIZENS;
  });

  const [currentCitizen, setCurrentCitizen] = useState<CitizenProfile>(() => {
    if (authProfile) return authProfile;
    const savedId = localStorage.getItem('jansetu_active_citizen_id');
    const match = allCitizens.find(c => c.id === savedId);
    return match || allCitizens[0] || INITIAL_CITIZENS[0];
  });

  // Keep currentCitizen synchronized when authProfile changes
  useEffect(() => {
    if (authProfile) {
      setCurrentCitizen(authProfile);
      setAllCitizens(prev => {
        const index = prev.findIndex(c => c.id === authProfile.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = authProfile;
          return next;
        }
        return [authProfile, ...prev];
      });
    }
  }, [authProfile]);

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const saved = localStorage.getItem('jansetu_grievances');
    return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
  });

  const [schemes, setSchemes] = useState<WelfareScheme[]>(() => {
    return WELFARE_SCHEMES;
  });

  const [appliedSchemeIds, setAppliedSchemeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jansetu_applied_schemes');
    return saved ? JSON.parse(saved) : ['pm-kisan'];
  });

  const [rtiRequests, setRtiRequests] = useState<RtiRequest[]>(() => {
    const saved = localStorage.getItem('jansetu_rti_requests');
    return saved ? JSON.parse(saved) : INITIAL_RTI_REQUESTS;
  });

  const [circulars, setCirculars] = useState<CircularDoc[]>(OFFICIAL_CIRCULARS);
  const [activeView, setActiveView] = useState<'dashboard' | 'schemes' | 'grievances' | 'documents' | 'rti-assistant'>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('jansetu_citizens', JSON.stringify(allCitizens));
  }, [allCitizens]);

  useEffect(() => {
    localStorage.setItem('jansetu_active_citizen_id', currentCitizen.id);
  }, [currentCitizen]);

  useEffect(() => {
    localStorage.setItem('jansetu_grievances', JSON.stringify(grievances));
  }, [grievances]);

  useEffect(() => {
    localStorage.setItem('jansetu_applied_schemes', JSON.stringify(appliedSchemeIds));
  }, [appliedSchemeIds]);

  useEffect(() => {
    localStorage.setItem('jansetu_rti_requests', JSON.stringify(rtiRequests));
  }, [rtiRequests]);

  const switchCitizen = (citizenId: string) => {
    const found = allCitizens.find(c => c.id === citizenId);
    if (found) {
      setCurrentCitizen(found);
      quickLoginPreset(citizenId);
    }
  };

  const updateCitizenProfile = async (updates: Partial<CitizenProfile>) => {
    setIsSavingProfile(true);
    const updated = { ...currentCitizen, ...updates };
    setCurrentCitizen(updated);
    setAllCitizens(prev => prev.map(c => (c.id === updated.id ? updated : c)));

    try {
      await updateProfileAttributes(updates);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addGrievance = (newGrievance: Grievance) => {
    setGrievances(prev => [newGrievance, ...prev]);
  };

  const applyForScheme = (schemeId: string) => {
    if (!appliedSchemeIds.includes(schemeId)) {
      setAppliedSchemeIds(prev => [...prev, schemeId]);
    }
  };

  const addRtiRequest = (request: RtiRequest) => {
    setRtiRequests(prev => [request, ...prev]);
  };

  return (
    <CitizenContext.Provider
      value={{
        currentCitizen,
        allCitizens,
        switchCitizen,
        updateCitizenProfile,
        grievances,
        addGrievance,
        schemes,
        appliedSchemeIds,
        applyForScheme,
        rtiRequests,
        addRtiRequest,
        circulars,
        activeView,
        setActiveView,
        globalSearchQuery,
        setGlobalSearchQuery,
        isSavingProfile,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
};

export function useCitizen() {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
}

import apiClient from './client';
import {
    ApiResponse,
    AuthResponse,
    User,
    Company,
    Competition,
    Match,
    MatchResult,
    MatchScorer,
    CompanyArea,
    Employee,
    Prode,
    Prediction,
} from '@/lib/types';
import { mockApi } from '@/lib/mock/api';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyAreaId: string;
}

export const authApi = {
    login: async (data: LoginRequest) => {
        if (USE_MOCK) {
            return mockApi.login(data);
        }
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest) => {
        if (USE_MOCK) {
            return mockApi.register(data);
        }
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data;
    },
};

export interface CreateCompanyRequest {
    name: string;
    slug: string;
    corporateDomain?: string;
    requireCorporateEmail?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    adminEmail: string;
    adminPassword: string;
}

export interface UpdateCompanyRequest {
    name?: string;
    corporateDomain?: string;
    requireCorporateEmail?: boolean;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    isActive?: boolean;
}

export const adminCompaniesApi = {
    getAll: async () => {
        if (USE_MOCK) {
            return mockApi.getCompanies();
        }
        const response = await apiClient.get<ApiResponse<Company[]>>('/admin/companies');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Company>>(`/admin/companies/${id}`);
        return response.data;
    },

    create: async (data: CreateCompanyRequest) => {
        const response = await apiClient.post<ApiResponse<Company>>('/admin/companies', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCompanyRequest) => {
        const response = await apiClient.put<ApiResponse<Company>>(`/admin/companies/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/admin/companies/${id}`);
        return response.data;
    },
};

export interface CreateCompetitionRequest {
    name: string;
    slug: string;
    startDate: string;
    endDate: string;
    sportType?: string;
    isActive?: boolean;
}

export interface UpdateCompetitionRequest {
    name?: string;
    startDate?: string;
    endDate?: string;
    sportType?: string;
    isActive?: boolean;
}

export const adminCompetitionsApi = {
    getAll: async () => {
        if (USE_MOCK) {
            return mockApi.getCompetitions();
        }
        const response = await apiClient.get<ApiResponse<Competition[]>>('/admin/competitions');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Competition>>(`/admin/competitions/${id}`);
        return response.data;
    },

    create: async (data: CreateCompetitionRequest) => {
        const response = await apiClient.post<ApiResponse<Competition>>('/admin/competitions', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCompetitionRequest) => {
        const response = await apiClient.put<ApiResponse<Competition>>(`/admin/competitions/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/admin/competitions/${id}`);
        return response.data;
    },
};

export interface CreateMatchRequest {
    competitionId: string;
    teamA: string;
    teamB: string;
    matchDate: string;
    stage: string;
    location?: string;
    status?: 'scheduled' | 'in_progress' | 'finished';
}

export interface UpdateMatchRequest {
    matchDate?: string;
    stage?: string;
    location?: string;
    status?: string;
}

export interface LoadMatchResultRequest {
    goalsTeamA: number;
    goalsTeamB: number;
    yellowCardsTeamA?: number;
    yellowCardsTeamB?: number;
    redCardsTeamA?: number;
    redCardsTeamB?: number;
}

export interface AddScorerRequest {
    playerFullName: string;
    teamId: string;
    goalsCount: number;
}

export const adminMatchesApi = {
    getAll: async (competitionId?: string) => {
        if (USE_MOCK) {
            return mockApi.getMatches(competitionId);
        }
        const params = competitionId ? { competitionId } : {};
        const response = await apiClient.get<ApiResponse<Match[]>>('/admin/matches', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Match>>(`/admin/matches/${id}`);
        return response.data;
    },

    create: async (data: CreateMatchRequest) => {
        const response = await apiClient.post<ApiResponse<Match>>('/admin/matches', data);
        return response.data;
    },

    update: async (id: string, data: UpdateMatchRequest) => {
        const response = await apiClient.put<ApiResponse<Match>>(`/admin/matches/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/admin/matches/${id}`);
        return response.data;
    },

    loadResult: async (id: string, data: LoadMatchResultRequest) => {
        const response = await apiClient.put<ApiResponse<MatchResult>>(`/admin/matches/${id}/result`, data);
        return response.data;
    },

    addScorer: async (id: string, data: AddScorerRequest) => {
        const response = await apiClient.post<ApiResponse<MatchScorer>>(`/admin/matches/${id}/scorers`, data);
        return response.data;
    },
};

export const companyApi = {
    getConfig: async () => {
        const response = await apiClient.get<ApiResponse<Company>>('/company/config');
        return response.data;
    },

    updateConfig: async (data: UpdateCompanyRequest) => {
        const response = await apiClient.put<ApiResponse<Company>>('/company/config', data);
        return response.data;
    },

    getAreas: async () => {
        const response = await apiClient.get<ApiResponse<CompanyArea[]>>('/company/areas');
        return response.data;
    },

    createArea: async (data: { name: string; description?: string }) => {
        const response = await apiClient.post<ApiResponse<CompanyArea>>('/company/areas', data);
        return response.data;
    },

    updateArea: async (id: string, data: { name?: string; description?: string }) => {
        const response = await apiClient.put<ApiResponse<CompanyArea>>(`/company/areas/${id}`, data);
        return response.data;
    },

    deleteArea: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/company/areas/${id}`);
        return response.data;
    },

    getEmployees: async (areaId?: string) => {
        const params = areaId ? { areaId } : {};
        const response = await apiClient.get<ApiResponse<Employee[]>>('/company/employees', { params });
        return response.data;
    },

    blockEmployee: async (id: string) => {
        const response = await apiClient.put<ApiResponse<Employee>>(`/company/employees/${id}/block`);
        return response.data;
    },

    unblockEmployee: async (id: string) => {
        const response = await apiClient.put<ApiResponse<Employee>>(`/company/employees/${id}/unblock`);
        return response.data;
    },

    getProdes: async () => {
        const response = await apiClient.get<ApiResponse<Prode[]>>('/company/prodes');
        return response.data;
    },

    createProde: async (data: {
        name: string;
        description?: string;
        competitionId: string;
        participationMode: 'general' | 'by_area' | 'both';
    }) => {
        // For now, send a minimal default configuration
        // TODO: Add proper variable configuration UI later
        const payload = {
            ...data,
            variableConfigs: [
                {
                    predictionVariableId: '00000000-0000-0000-0000-000000000001', // Default result prediction
                    points: 3,
                    isActive: true
                }
            ]
        };
        const response = await apiClient.post<ApiResponse<Prode>>('/company/prodes', payload);
        return response.data;
    },

    updateProde: async (id: string, data: {
        name?: string;
        description?: string;
        participationMode?: 'general' | 'by_area' | 'both';
    }) => {
        const response = await apiClient.put<ApiResponse<Prode>>(`/company/prodes/${id}`, data);
        return response.data;
    },

    deleteProde: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/company/prodes/${id}`);
        return response.data;
    },
};

export const prodeApi = {
    getAll: async () => {
        if (USE_MOCK) {
            return mockApi.getProdes();
        }
        const response = await apiClient.get<ApiResponse<Prode[]>>('/prodes');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Prode>>(`/prodes/${id}`);
        return response.data;
    },

    join: async (id: string) => {
        const response = await apiClient.post<ApiResponse<void>>(`/prodes/${id}/join`);
        return response.data;
    },

    getMatches: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Match[]>>(`/prodes/${id}/matches`);
        return response.data;
    },

    getRankings: async (id: string, type: 'general' | 'my-area' | 'areas') => {
        const response = await apiClient.get<ApiResponse<any>>(`/prodes/${id}/rankings/${type}`);
        return response.data;
    },
};

export const predictionApi = {
    create: async (data: {
        prodeId: string;
        matchId: string;
        predictedGoalsTeamA: number;
        predictedGoalsTeamB: number;
        predictedScorer?: string;
    }) => {
        const response = await apiClient.post<ApiResponse<Prediction>>('/predictions', data);
        return response.data;
    },

    getMyPredictions: async () => {
        const response = await apiClient.get<ApiResponse<Prediction[]>>('/predictions/my');
        return response.data;
    },
};

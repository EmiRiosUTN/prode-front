import apiClient from './client';
import {
    ApiResponse,
    AuthResponse,
    RegisterResponse,
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
    PredictionVariable,
    RankingResponse,
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
    companyAreaId?: string;
    extraData?: Record<string, string>;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
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
        const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
        return response.data;
    },

    verifyEmail: async (token: string) => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
        return response.data;
    },

    resendVerification: async (email: string) => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string) => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest) => {
        const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
        return response.data;
    },
};

export interface CreateCompanyRequest {
    name: string;
    slug: string;
    corporateDomain?: string; // Backend actually uses camelCase
    requireCorporateEmail?: boolean; // Backend actually uses camelCase
    logoUrl?: string; // Backend actually uses camelCase
    primaryColor?: string; // Backend actually uses camelCase
    secondaryColor?: string; // Backend actually uses camelCase
    adminEmail: string;
    adminPassword: string;
    adminFirstName?: string;
    adminLastName?: string;
    sendVerificationEmail?: boolean;
    aiEnabled?: boolean;
    registrationFields?: import('@/lib/types').RegistrationFieldConfig[];
}

export interface UpdateCompanyRequest {
    name?: string;
    slug?: string;
    corporateDomain?: string; // Backend actually uses camelCase
    requireCorporateEmail?: boolean; // Backend actually uses camelCase
    requireEmailConfirmation?: boolean;
    logoUrl?: string; // Backend actually uses camelCase
    primaryColor?: string; // Backend actually uses camelCase
    secondaryColor?: string; // Backend actually uses camelCase
    isActive?: boolean; // Backend actually uses camelCase
    aiEnabled?: boolean;
    registrationFields?: import('@/lib/types').RegistrationFieldConfig[];
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

    getAllPublic: async () => {
        const response = await apiClient.get<ApiResponse<Competition[]>>('/admin/competitions/public');
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

export interface ImportCompetitionRequest {
    apiFootballLeagueId: number;
    apiFootballSeason: number;
    competitionName?: string;
    slug?: string;
}

export interface ImportFixturesRequest {
    competitionId: string;
    apiFootballLeagueId: number;
    apiFootballSeason: number;
}

export interface ImportCompetitionResponse {
    competitionId: string;
    competitionName: string;
    competitionCreated: boolean;
    total: number;
    created: number;
    skipped: number;
    resultsImported: number;
    errors: number;
    errorDetails: string[];
}

export interface UpdateResultsResponse {
    competitions: number;
    totalUpdated: number;
    details: any[];
}

export const apiFootballApi = {
    importCompetition: async (data: ImportCompetitionRequest) => {
        const response = await apiClient.post<ApiResponse<ImportCompetitionResponse>>(
            '/admin/api-football/import-competition',
            data,
        );
        return response.data;
    },

    importFixtures: async (data: ImportFixturesRequest) => {
        const response = await apiClient.post<ApiResponse<any>>(
            '/admin/api-football/import-fixtures',
            data,
        );
        return response.data;
    },
    
    updateResults: async (competitionId?: string) => {
        const response = await apiClient.post<ApiResponse<UpdateResultsResponse>>(
            '/admin/api-football/update-results',
            { competitionId }
        );
        return response.data;
    }
};



// Prediction Variables API
export const predictionVariablesApi = {
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<PredictionVariable[]>>('/admin/prediction-variables');
        return response.data;
    },
};

export interface CreateMatchRequest {
    competitionId: string;
    teamA: string;
    teamB: string;
    teamAFlagUrl?: string;
    teamBFlagUrl?: string;
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
    teamAFlagUrl?: string;
    teamBFlagUrl?: string;
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
    getPublicConfig: async () => {
        const response = await apiClient.get<ApiResponse<Company & { areas: CompanyArea[] }>>('/company/public/config');
        return response.data;
    },

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

    updateArea: async (id: string, data: { name?: string; description?: string; isActive?: boolean }) => {
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
        companyAreaId?: string;
        showAreaRanking?: boolean;
        areaRankingCalculation?: 'sum' | 'average';
        winnerCount?: number;
        individualPrize?: string;
        rewardAreaWinner?: boolean;
        areaPrize?: string;
        variableConfigs: Array<{
            predictionVariableId: string;
            points: number;
            isActive?: boolean;
        }>;
    }) => {
        const response = await apiClient.post<ApiResponse<Prode>>('/company/prodes', data);
        return response.data;
    },

    updateProde: async (id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
        participationMode?: 'general' | 'by_area' | 'both';
        showAreaRanking?: boolean;
        areaRankingCalculation?: 'sum' | 'average';
        winnerCount?: number;
        individualPrize?: string;
        rewardAreaWinner?: boolean;
        areaPrize?: string;
        variableConfigs?: Array<{
            predictionVariableId: string;
            points: number;
            isActive?: boolean;
        }>;
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
        const response = await apiClient.get<ApiResponse<Prode[]>>('/employee/prodes');
        return response.data;
    },

    getAvailable: async () => {
        const response = await apiClient.get<ApiResponse<Prode[]>>('/employee/prodes/available');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Prode>>(`/employee/prodes/${id}`);
        return response.data;
    },

    join: async (id: string) => {
        const response = await apiClient.post<ApiResponse<void>>(`/employee/prodes/${id}/join`);
        return response.data;
    },

    getMatches: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Match[]>>(`/employee/prodes/${id}/matches`);
        return response.data;
    },

    getRankings: async (id: string, type: 'general' | 'my-area' | 'areas') => {
        const response = await apiClient.get<ApiResponse<RankingResponse>>(`/prodes/${id}/rankings/${type}`);
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
        const response = await apiClient.post<ApiResponse<Prediction>>('/employee/predictions', data);
        return response.data;
    },

    upsert: async (data: {
        prodeId: string;
        matchId: string;
        homeScore: number;
        awayScore: number;
        homeYellowCards?: number;
        awayYellowCards?: number;
        homeRedCards?: number;
        awayRedCards?: number;
        winnerId?: string;
    }) => {
        const response = await apiClient.post<ApiResponse<Prediction>>('/employee/predictions', data);
        return response.data;
    },

    getMyPredictions: async () => {
        const response = await apiClient.get<ApiResponse<Prediction[]>>('/employee/predictions/my');
        return response.data;
    },

    getAvailableCopies: async (matchId: string, prodeId: string) => {
        const response = await apiClient.get<ApiResponse<{
            availablePredictions: Array<{
                prodeId: string;
                prodeName: string;
                prediction: {
                    predicted_goals_team_a: number;
                    predicted_goals_team_b: number;
                    predicted_yellow_cards_team_a?: number | null;
                    predicted_yellow_cards_team_b?: number | null;
                    predicted_red_cards_team_a?: number | null;
                    predicted_red_cards_team_b?: number | null;
                };
            }>;
        }>>(`/employee/predictions/match/${matchId}/available-copies?prodeId=${prodeId}`);
        return response.data;
    },
};

export const employeeApi = {
    getMatchAnalysis: async (matchId: string) => {
        const response = await apiClient.get<ApiResponse<{
            teamA_win_probability: number;
            teamB_win_probability: number;
            draw_probability: number;
            expected_yellow_cards: { min: number; max: number };
            expected_red_cards: { min: number; max: number };
            generated_at: string;
        } | null>>(`/employee/matches/${matchId}/ai-analysis`);
        return response.data;
    },
};

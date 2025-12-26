import { ApiResponse, AuthResponse } from '@/lib/types';
import {
    mockUsers,
    mockCompanies,
    mockCompetitions,
    mockMatches,
    mockProdes,
} from './data';
import { LoginRequest, RegisterRequest } from '@/lib/api/endpoints';

const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        await delay();

        const userRecord = mockUsers[credentials.email];

        if (!userRecord || userRecord.password !== credentials.password) {
            throw new Error('Credenciales inválidas');
        }

        return {
            success: true,
            data: {
                accessToken: userRecord.token,
                user: userRecord.user,
            },
        };
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        await delay();
        throw new Error('Registro no disponible en modo mock');
    },

    getCompanies: async () => {
        await delay();
        return {
            success: true,
            data: mockCompanies,
        };
    },

    getCompanyById: async (id: string) => {
        await delay();
        const company = mockCompanies.find((c) => c.id === id);
        if (!company) throw new Error('Company not found');
        return {
            success: true,
            data: company,
        };
    },

    createCompany: async (data: any) => {
        await delay();
        const newCompany = {
            id: `company-${Date.now()}`,
            ...data,
            isActive: true,
            _count: { employees: 0, prodes: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockCompanies.push(newCompany);
        return {
            success: true,
            data: newCompany,
        };
    },

    getCompetitions: async () => {
        await delay();
        return {
            success: true,
            data: mockCompetitions,
        };
    },

    getCompetitionById: async (id: string) => {
        await delay();
        const competition = mockCompetitions.find((c) => c.id === id);
        if (!competition) throw new Error('Competition not found');
        return {
            success: true,
            data: competition,
        };
    },

    getMatches: async (competitionId?: string) => {
        await delay();
        let matches = mockMatches;
        if (competitionId) {
            matches = matches.filter((m) => m.competition_id === competitionId);
        }
        return {
            success: true,
            data: matches,
        };
    },

    getMatchById: async (id: string) => {
        await delay();
        const match = mockMatches.find((m) => m.id === id);
        if (!match) throw new Error('Match not found');
        return {
            success: true,
            data: match,
        };
    },

    getProdes: async () => {
        await delay();
        return {
            success: true,
            data: mockProdes,
        };
    },

    getProdeById: async (id: string) => {
        await delay();
        const prode = mockProdes.find((p) => p.id === id);
        if (!prode) throw new Error('Prode not found');
        return {
            success: true,
            data: prode,
        };
    },

    joinProde: async (id: string) => {
        await delay();
        return {
            success: true,
            data: undefined,
        };
    },
};

// User roles
export type UserRole = 'admin_global' | 'empresa_admin' | 'empleado';

// Match status
export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';

// Sport types
export type SportType = 'futbol' | 'basketball' | 'rugby';

// User entity
export interface User {
    id: string;
    email: string;
    role: UserRole;
    employee: Employee | null;
    createdAt: string;
    updatedAt: string;
}

// Employee entity
export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    company: Company;
    area: CompanyArea;
    userId: string;
    user?: User;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
}


// Company entity
export interface Company {
    id: string;
    name: string;
    slug: string;
    corporateDomain?: string;
    requireCorporateEmail: boolean;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    isActive: boolean;
    adminUser?: User;
    _count?: {
        areas: number;
        employees: number;
        prodes: number;
    };
    createdAt: string;
    updatedAt: string;
}

// Company Area entity
export interface CompanyArea {
    id: string;
    name: string;
    description?: string;
    companyId: string;
    isActive: boolean;
    _count?: {
        employees: number;
    };
    createdAt: string;
    updatedAt: string;
}


// Competition entity
export interface Competition {
    id: string;
    name: string;
    slug: string;
    start_date: string; // Backend uses snake_case
    end_date: string;   // Backend uses snake_case
    sport_type?: string; // Backend uses snake_case
    isActive: boolean;
    _count?: {
        matches: number;
        prodes: number;
    };
    createdAt: string;
    updatedAt: string;
}

// Team entity
export interface Team {
    id: string;
    name: string;
    code: string;
    flagUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// Match entity
export interface Match {
    id: string;
    competition_id: string; // Backend uses snake_case
    competition?: Competition;
    team_a_id: string; // Backend uses snake_case
    team_a?: Team; // Backend uses snake_case
    team_b_id: string; // Backend uses snake_case
    team_b?: Team; // Backend uses snake_case
    match_date: string; // Backend uses snake_case
    stage: string;
    location?: string;
    status: MatchStatus;
    match_result?: MatchResult; // Backend uses snake_case
    created_at: string; // Backend uses snake_case
    updated_at: string; // Backend uses snake_case
}

// Match Result entity
export interface MatchResult {
    id: string;
    matchId: string;
    goalsTeamA: number;
    goalsTeamB: number;
    yellowCardsTeamA?: number;
    yellowCardsTeamB?: number;
    redCardsTeamA?: number;
    redCardsTeamB?: number;
    finalizedAt: string;
    scorers?: MatchScorer[];
    createdAt: string;
    updatedAt: string;
}

// Match Scorer entity
export interface MatchScorer {
    id: string;
    matchResultId: string;
    playerFullName: string;
    teamId: string;
    team?: Team;
    goalsCount: number;
    createdAt: string;
}

// Prode entity
export interface Prode {
    id: string;
    name: string;
    description?: string;
    companyId: string;
    company?: Company;
    competitionId: string;
    competition?: Competition;
    isActive: boolean;
    startDate: string;
    endDate: string;
    _count?: {
        participants: number;
    };
    createdAt: string;
    updatedAt: string;
}


// Prediction entity
export interface Prediction {
    id: string;
    prodeParticipantId: string;
    matchId: string;
    match?: Match;
    predictedGoalsTeamA: number;
    predictedGoalsTeamB: number;
    predictedScorer?: string;
    points?: number;
    createdAt: string;
    updatedAt: string;
}

// Prode Participant entity
export interface ProdeParticipant {
    id: string;
    prodeId: string;
    employeeId: string;
    employee?: Employee;
    totalPoints: number;
    joinedAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// API Error response
export interface ApiError {
    success: false;
    statusCode: number;
    error: string;
    message: string | string[];
}

// Auth response
export interface AuthResponse {
    accessToken: string;
    user: User;
}

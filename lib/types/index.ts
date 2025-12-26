// User roles
export type UserRole = 'admin_global' | 'empresa_admin' | 'empleado';

// Match status
export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';

// Sport types
export type SportType = 'futbol' | 'basketball' | 'rugby';

// Prediction variable types
export interface ProdeVariableConfig {
    id: string;
    prodeId: string;
    predictionVariableId: string;
    prediction_variable: PredictionVariable; // Backend returns snake_case nested relation
    points: number;
    is_active: boolean;
}

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
    first_name: string; // Backend uses snake_case
    last_name: string; // Backend uses snake_case
    phone?: string;
    company: Company;
    area: CompanyArea;
    user_id: string; // Backend uses snake_case
    user?: User;
    is_blocked: boolean; // Backend uses snake_case
    created_at: string; // Backend uses snake_case
    updated_at: string; // Backend uses snake_case
}



// Company entity
export interface Company {
    id: string;
    name: string;
    slug: string;
    corporate_domain?: string; // Backend uses snake_case
    require_corporate_email: boolean; // Backend uses snake_case
    logo_url?: string; // Backend uses snake_case
    primary_color?: string; // Backend uses snake_case
    secondary_color?: string; // Backend uses snake_case
    is_active: boolean; // Backend uses snake_case
    admin_user_id?: string; // Backend uses snake_case
    admin_user?: User; // Backend uses snake_case
    _count?: {
        areas: number;
        employees: number;
        prodes: number;
    };
    created_at: string; // Backend uses snake_case
    updated_at: string; // Backend uses snake_case
}

// Company Area entity
export interface CompanyArea {
    id: string;
    name: string;
    description?: string;
    companyId: string;
    is_active: boolean;
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
    is_active: boolean; // Backend uses snake_case
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
    flag_url?: string;
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
    isLocked?: boolean;
}

// Match Result entity
export interface MatchResult {
    id: string;
    match_id: string;
    goals_team_a: number;
    goals_team_b: number;
    yellow_cards_team_a?: number;
    yellow_cards_team_b?: number;
    red_cards_team_a?: number;
    red_cards_team_b?: number;
    finalized_at: string;
    scorers?: MatchScorer[];
    created_at: string;
    updated_at: string;
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

// Prode Ranking Config
export interface ProdeRankingConfig {
    id: string;
    prode_id: string;
    show_individual_general: boolean;
    show_individual_by_area: boolean;
    show_area_ranking: boolean;
    area_ranking_calculation: 'average' | 'sum';
    created_at: string;
    updated_at: string;
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
    is_active: boolean; // Backend uses snake_case

    prode_variable_configs?: ProdeVariableConfig[]; // Backend uses snake_case
    prode_ranking_config?: ProdeRankingConfig; // Backend uses snake_case
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
    predicted_goals_team_a?: number; // Updated to match Prisma/Backend
    predicted_goals_team_b?: number;
    predicted_yellow_cards_team_a?: number;
    predicted_yellow_cards_team_b?: number;
    predicted_red_cards_team_a?: number;
    predicted_red_cards_team_b?: number;

    // Backward compatibility for existing code if any (though we should migrate)
    // Actually MatchList was using predictedGoalsTeamA, we need to fix MatchList too.
    // For now let's keep both or migrate MatchList. Migrating MatchList is cleaner.
    // I will remove the old camelCase ones to force compilation errors and fix them.
    predictedScorer?: string;
    points?: number;
    createdAt: string;
    updatedAt: string;
}

// Prediction Variable entity
export interface PredictionVariable {
    id: string;
    code: string;
    name: string;
    description?: string;
    variable_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
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

// Ranking entities
export interface RankingMetadata {
    prodeId: string;
    prodeName: string;
    totalParticipants: number;
    lastUpdated: string | Date;
    isCached: boolean;
}

export interface IndividualRankingEntry {
    employeeId: string;
    employeeName: string;
    areaName: string;
    totalPoints: number;
    predictionsCount: number;
    position: number;
}

export interface AreaRankingEntry {
    areaId: string;
    areaName: string;
    totalPoints: number;
    participantsCount: number;
    topEmployees: Array<{
        employeeId: string;
        employeeName: string;
        totalPoints: number;
    }>;
    position: number;
}

export interface RankingResponse {
    metadata: RankingMetadata;
    ranking: IndividualRankingEntry[] | AreaRankingEntry[];
}

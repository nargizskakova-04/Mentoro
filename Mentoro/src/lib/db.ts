// This is a minimal in-memory mock database to allow the application to run without a real database connection.
// In a real application, this would be a PrismaClient instance.

declare global {
    var prisma: any;
}

class MockPrismaClient {
    private users: any[] = [];

    constructor() {
        // Initialize with a demo user if needed
    }

    user = {
        findUnique: async ({ where }: any) => {
            if (where.email) {
                return this.users.find(u => u.email === where.email) || null;
            }
            if (where.id) {
                return this.users.find(u => u.id === where.id) || null;
            }
            return null;
        },
        create: async ({ data }: any) => {
            // Assign random academic data for demo purposes
            const majors = ['Software Engineering', 'Computer Science', 'Cybersecurity', 'Data Science'];
            const groups = ['SE-2309', 'CS-2024', 'CYB-101', 'DS-303'];

            const newUser = {
                id: Math.random().toString(36).substring(7),
                ...data,
                major: majors[Math.floor(Math.random() * majors.length)],
                group: groups[Math.floor(Math.random() * groups.length)],
                gpa: (3.0 + Math.random()).toFixed(2),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.users.push(newUser);
            return newUser;
        },
    };
}

// Singleton pattern to preserve data across HMR in development
export const db = global.prisma || new MockPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = db;
}

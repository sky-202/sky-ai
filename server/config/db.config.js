import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient({
    log: ["Query"],
})

export default prisma;  
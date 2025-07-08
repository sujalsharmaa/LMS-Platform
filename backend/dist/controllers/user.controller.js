import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// CREATE
export const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await prisma.user.create({ data: { name, email } });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'User already exists or bad request' });
    }
};
// READ ALL
export const getAllUsers = async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
};
// READ ONE
export const getUserById = async (req, res) => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    user ? res.json(user) : res.status(404).json({ error: 'User not found' });
};
// UPDATE
export const updateUser = async (req, res) => {
    const id = Number(req.params.id);
    const { name, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id },
            data: { name, email },
        });
        res.json(user);
    }
    catch (error) {
        res.status(404).json({ error: 'User not found' });
    }
};
// DELETE
export const deleteUser = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch {
        res.status(404).json({ error: 'User not found' });
    }
};

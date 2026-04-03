const { Ps, User } = require('../models');

async function createParentStudent(parent_id, student_id) {
    const parent = await User.findByPk(parent_id);
    if (!parent) throw new Error('Usuario no encontrado');
    if (parent.role !== 'parent') throw new Error('El usuario no es un padre');

    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

    const existing = await Ps.findOne({ where: { parent_id, student_id } });
    if (existing) throw new Error('Ese padre ya está vinculado a ese alumno');

    const ps = await Ps.create({ parent_id, student_id });
    return ps;
}

async function getStudentsByParent(parent_id) {
    const parent = await User.findByPk(parent_id);
    if (!parent) throw new Error('Usuario no encontrado');
    if (parent.role !== 'parent') throw new Error('El usuario no es un padre');

    const ps = await Ps.findAll({
        where: { parent_id },
        include: [{ model: User, as: 'student', foreignKey: 'student_id', attributes: ['name', 'lastname'] }]
    });
    return ps;
}

async function deleteParentStudent(id) {
    const ps = await Ps.findByPk(id);
    if (!ps) throw new Error('Vínculo no encontrado');
    await ps.destroy();
    return { message: 'Vínculo eliminado correctamente' };
}

async function updateParentStudent(parent_id, student_ids) {
    const parent = await User.findByPk(parent_id);
    if (!parent) throw new Error('Usuario no encontrado');
    if (parent.role !== 'parent') throw new Error('El usuario no es un padre');

    // Validate all student_ids
    if (student_ids.length > 0) {
        const students = await User.findAll({ where: { id: student_ids } });
        if (students.length !== student_ids.length) {
            throw new Error('Uno o más estudiantes no existen');
        }
        const allStudents = students.every(s => s.role === 'student');
        if (!allStudents) throw new Error('Uno o más usuarios no son estudiantes');
    }

    // Delete existing links for this parent
    await Ps.destroy({ where: { parent_id } });

    // Create new links
    const newLinks = [];
    for (const student_id of student_ids) {
        const existing = await Ps.findOne({ where: { parent_id, student_id } });
        if (!existing) {
            const ps = await Ps.create({ parent_id, student_id });
            newLinks.push(ps);
        }
    }

    return newLinks;
}

module.exports = { createParentStudent, getStudentsByParent, deleteParentStudent, updateParentStudent };
const { Announcement, Course, User, Cs } = require('../models');

// Create a new announcement
async function create(req, res) {
    try {
        const { title, description, course_id } = req.body;
        
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Check if course_id is actually a cs_id (course_subject ID)
        // This happens when the frontend sends the cs_id from teacher_courses
        let actualCourseId = course_id;
        
        // Try to find if this ID exists in course_subject table
        const cs = await Cs.findByPk(course_id);
        if (cs) {
            // It's a cs_id, use the course_id from the relationship
            actualCourseId = cs.course_id;
        }
        
        const course = await Course.findByPk(actualCourseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        const announcement = await Announcement.create({
            title,
            description,
            course_id: actualCourseId,
            teacher_id: req.user.id
        });

        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get announcements for a specific course
async function getByCourse(req, res) {
    try {
        const { course_id } = req.params;
        
        const announcements = await Announcement.findAll({
            where: { course_id },
            include: [
                {
                    model: User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'lastname']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name', 'year']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get all announcements for courses that a student is enrolled in
async function getForStudent(req, res) {
    try {
        const { student_id } = req.params;
        
        const announcements = await Announcement.findAll({
            include: [
                {
                    model: User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'lastname']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name', 'year'],
                    required: true,
                    include: [{
                        model: require('../models').Enrollment,
                        where: { student_id: parseInt(student_id) },
                        attributes: []
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get all announcements for courses that a parent's children are enrolled in
async function getForParent(req, res) {
    try {
        const { parent_id } = req.params;
        const { Ps, Enrollment, Course, User } = require('../models');
        
        // Step 1: Find all students linked to this parent
        const parentStudents = await Ps.findAll({
            where: { parent_id: parseInt(parent_id) },
            attributes: ['student_id']
        });
        
        if (parentStudents.length === 0) {
            return res.status(200).json([]);
        }
        
        const studentIds = parentStudents.map(ps => ps.student_id);
        
        // Step 2: Find all courses where these students are enrolled
        const enrollments = await Enrollment.findAll({
            where: { student_id: studentIds },
            attributes: ['course_id']
        });
        
        if (enrollments.length === 0) {
            return res.status(200).json([]);
        }
        
        const courseIds = [...new Set(enrollments.map(e => e.course_id))];
        
        // Step 3: Get all announcements for these courses
        const announcements = await Announcement.findAll({
            where: { course_id: courseIds },
            include: [
                {
                    model: User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'lastname']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name', 'year']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get announcements by teacher
async function getByTeacher(req, res) {
    try {
        const { teacher_id } = req.params;
        
        const announcements = await Announcement.findAll({
            where: { teacher_id },
            include: [
                {
                    model: User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'lastname']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'name', 'year']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete an announcement
async function remove(req, res) {
    try {
        const { id } = req.params;
        
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const announcement = await Announcement.findByPk(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Anuncio no encontrado' });
        }

        if (announcement.teacher_id !== req.user.id) {
            return res.status(403).json({ message: 'No autorizado para eliminar este anuncio' });
        }

        await announcement.destroy();
        res.status(200).json({ message: 'Anuncio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getByCourse, getForStudent, getForParent, getByTeacher, remove };

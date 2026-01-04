import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Counter from '../models/Counter.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bvm_queue_management');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Counter.deleteMany({});
        console.log('Cleared existing data');

        // Create student account
        const student = await User.create({
            email: '25ec443@bvmengineering.ac.in',
            password: 'password123',
            userType: 'student',
            fullName: 'Test Student',
            rollNumber: '25EC443',
            department: 'Electronics & Communication',
            semester: 4,
            mobileNumber: '9876543210',
            parentContact: { name: 'Parent Name', email: 'parent@email.com', mobileNumber: '9876543211' }
        });
        console.log('Created student:', student.email);

        // Create faculty accounts
        const facultyEmails = ['25ec407@bvmengineering.ac.in', '25ec457@bvmengineering.ac.in', '25ec460@bvmengineering.ac.in'];
        const facultyNames = ['Faculty Admin 1', 'Faculty Admin 2', 'Faculty Admin 3'];
        const facultyIds = [];

        for (let i = 0; i < facultyEmails.length; i++) {
            const faculty = await User.create({
                email: facultyEmails[i],
                password: 'password123',
                userType: 'faculty',
                fullName: facultyNames[i],
                department: 'Administration'
            });
            facultyIds.push(faculty._id);
            console.log('Created faculty:', faculty.email);
        }

        // Create counters
        const counters = [
            { counterNumber: 1, counterName: 'Admissions Counter', department: 'Admissions', description: 'New admissions and enrollment queries' },
            { counterNumber: 2, counterName: 'Scholarships Counter', department: 'Scholarships', description: 'Scholarship applications and queries' },
            { counterNumber: 3, counterName: 'Document Verification', department: 'Document Verification', description: 'Document verification and attestation' },
            { counterNumber: 4, counterName: 'Fees Counter', department: 'Fees', description: 'Fee payment and receipts' },
            { counterNumber: 5, counterName: 'General Enquiry', department: 'General Enquiry', description: 'General queries and information' }
        ];

        for (const c of counters) {
            await Counter.create({ ...c, assignedFaculty: facultyIds, isActive: true });
            console.log('Created counter:', c.counterName);
        }

        // Create parent account linked to student
        await User.create({
            email: 'parent@bvmengineering.ac.in',
            userType: 'parent',
            fullName: 'Test Parent',
            mobileNumber: '9876543211',
            linkedStudentId: student._id
        });
        console.log('Created parent account');

        console.log('\n✅ Database seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('Student: 25ec443@bvmengineering.ac.in / password123');
        console.log('Faculty: 25ec407@bvmengineering.ac.in / password123');
        console.log('Parent Mobile: 9876543211 (OTP will be shown in console)');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();

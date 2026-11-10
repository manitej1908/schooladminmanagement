const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Admin = require('./models/adminSchema');
const Sclass = require('./models/sclassSchema');
const Subject = require('./models/subjectSchema');
const Teacher = require('./models/teacherSchema');
const Student = require('./models/studentSchema');
const Notice = require('./models/noticeSchema');
const Complain = require('./models/complainSchema');

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected successfully.\n");

        // 1. Require an existing administrator in MongoDB
        const admin = await Admin.findOne({});
        if (!admin) {
            console.error("❌ No administrator found in the database.");
            console.error("👉 Please register the administrator first via:");
            console.error("   Frontend: http://localhost:3000/Adminregister");
            console.error("   API:      POST http://localhost:5000/AdminReg\n");
            console.error("Once registered, re-run 'npm run seed'.\n");
            await mongoose.disconnect();
            process.exit(1);
        }

        const schoolId = admin._id;
        console.log("==========================================");
        console.log(`Using Administrator: ${admin.name} (${admin.email})`);
        console.log(`School Name:         ${admin.schoolName}`);
        console.log(`School ID:           ${schoolId}`);
        console.log("==========================================\n");

        const stats = {
            classes: { inserted: 0, reused: 0 },
            subjects: { inserted: 0, reused: 0 },
            teachers: { inserted: 0, reused: 0 },
            students: { inserted: 0, reused: 0 },
            studentAttendance: { added: 0, existing: 0 },
            teacherAttendance: { added: 0, existing: 0 },
            notices: { inserted: 0, reused: 0 },
            complaints: { inserted: 0, reused: 0 }
        };

        // 2. Classes (4 Classes)
        const classNames = ['Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B'];
        const sclassMap = {};

        for (const name of classNames) {
            let sclass = await Sclass.findOne({ sclassName: name, school: schoolId });
            if (!sclass) {
                sclass = await Sclass.create({ sclassName: name, school: schoolId });
                stats.classes.inserted++;
            } else {
                stats.classes.reused++;
            }
            sclassMap[name] = sclass;
        }

        // Validate all classes exist before proceeding
        for (const name of classNames) {
            if (!sclassMap[name] || !sclassMap[name]._id) {
                throw new Error(`Reference validation failed: Class '${name}' is missing.`);
            }
        }

        // 3. Subjects (8 Subjects — 2 per Class)
        const subjectsData = [
            { subName: 'Mathematics 9', subCode: 'MTH901', sessions: '30', className: 'Class 9-A', hasTeacher: true },
            { subName: 'English Literature 9', subCode: 'ENG901', sessions: '25', className: 'Class 9-A', hasTeacher: true },
            { subName: 'General Science 9', subCode: 'SCI902', sessions: '30', className: 'Class 9-B', hasTeacher: false },
            { subName: 'Social Studies 9', subCode: 'SST902', sessions: '25', className: 'Class 9-B', hasTeacher: false },
            { subName: 'Advanced Mathematics 10', subCode: 'MTH101', sessions: '35', className: 'Class 10-A', hasTeacher: true },
            { subName: 'Physics & Chemistry 10', subCode: 'SCI101', sessions: '30', className: 'Class 10-A', hasTeacher: true },
            { subName: 'Computer Applications 10', subCode: 'CSC102', sessions: '30', className: 'Class 10-B', hasTeacher: true },
            { subName: 'Hindi Language 10', subCode: 'HND102', sessions: '25', className: 'Class 10-B', hasTeacher: false }
        ];

        const subjectMap = {};
        for (const sub of subjectsData) {
            const classDoc = sclassMap[sub.className];
            if (!classDoc) {
                throw new Error(`Reference validation failed: Class '${sub.className}' for subject '${sub.subName}' does not exist.`);
            }

            let subject = await Subject.findOne({ subCode: sub.subCode, school: schoolId });
            if (!subject) {
                subject = await Subject.create({
                    subName: sub.subName,
                    subCode: sub.subCode,
                    sessions: sub.sessions,
                    sclassName: classDoc._id,
                    school: schoolId
                });
                stats.subjects.inserted++;
            } else {
                stats.subjects.reused++;
            }
            subjectMap[sub.subCode] = subject;
        }

        for (const sub of subjectsData) {
            if (!subjectMap[sub.subCode] || !subjectMap[sub.subCode]._id) {
                throw new Error(`Reference validation failed: Subject '${sub.subCode}' is missing.`);
            }
        }

        // 4. Teachers (5 Teachers with Indian Names)
        const teacherPassword = await bcrypt.hash('teacher123', 10);
        const teachersData = [
            {
                name: 'Dr. Vikram Malhotra',
                email: 'vikram.malhotra@dps.edu.in',
                className: 'Class 10-A',
                subjectCode: 'MTH101',
                attendance: [
                    { date: new Date('2026-10-20'), presentCount: "28", absentCount: "2" },
                    { date: new Date('2026-10-27'), presentCount: "29", absentCount: "1" }
                ]
            },
            {
                name: 'Sunita Verma',
                email: 'sunita.verma@dps.edu.in',
                className: 'Class 10-A',
                subjectCode: 'SCI101',
                attendance: [
                    { date: new Date('2026-10-21'), presentCount: "27", absentCount: "3" },
                    { date: new Date('2026-10-28'), presentCount: "30", absentCount: "0" }
                ]
            },
            {
                name: 'Amitabh Mukherjee',
                email: 'amitabh.mukherjee@dps.edu.in',
                className: 'Class 9-A',
                subjectCode: 'MTH901',
                attendance: [
                    { date: new Date('2026-10-22'), presentCount: "26", absentCount: "4" }
                ]
            },
            {
                name: 'Priya Nambiar',
                email: 'priya.nambiar@dps.edu.in',
                className: 'Class 9-A',
                subjectCode: 'ENG901',
                attendance: [
                    { date: new Date('2026-10-23'), presentCount: "29", absentCount: "1" }
                ]
            },
            {
                name: 'Ramesh Kulkarni',
                email: 'ramesh.kulkarni@dps.edu.in',
                className: 'Class 10-B',
                subjectCode: 'CSC102',
                attendance: [
                    { date: new Date('2026-10-24'), presentCount: "28", absentCount: "2" }
                ]
            }
        ];

        const teacherMap = {};
        for (const t of teachersData) {
            const sclassDoc = sclassMap[t.className];
            const subjectDoc = subjectMap[t.subjectCode];

            if (!sclassDoc || !subjectDoc) {
                throw new Error(`Reference validation failed for teacher ${t.name}: Class '${t.className}' or Subject '${t.subjectCode}' missing.`);
            }

            let teacher = await Teacher.findOne({ email: t.email });
            if (!teacher) {
                teacher = await Teacher.create({
                    name: t.name,
                    email: t.email,
                    password: teacherPassword,
                    role: 'Teacher',
                    school: schoolId,
                    teachSclass: sclassDoc._id,
                    teachSubject: subjectDoc._id,
                    attendance: t.attendance
                });
                stats.teachers.inserted++;
            } else {
                teacher.teachSclass = sclassDoc._id;
                teacher.teachSubject = subjectDoc._id;

                for (const att of t.attendance) {
                    const exists = teacher.attendance.some(a =>
                        new Date(a.date).toDateString() === new Date(att.date).toDateString()
                    );
                    if (!exists) {
                        teacher.attendance.push(att);
                        stats.teacherAttendance.added++;
                    } else {
                        stats.teacherAttendance.existing++;
                    }
                }
                await teacher.save();
                stats.teachers.reused++;
            }

            // Ensure bidirectional reference: Subject points to Teacher
            await Subject.findByIdAndUpdate(subjectDoc._id, { teacher: teacher._id });
            teacherMap[t.email] = teacher;
        }

        // Ensure the 3 unassigned subjects remain unassigned
        const unassignedCodes = ['SCI902', 'SST902', 'HND102'];
        for (const code of unassignedCodes) {
            const sub = subjectMap[code];
            if (sub && sub.teacher) {
                await Subject.findByIdAndUpdate(sub._id, { $unset: { teacher: "" } });
            }
        }

        // 5. Students (20 Students — 5 per Class)
        const studentPassword = await bcrypt.hash('student123', 10);
        const studentsData = [
            // Class 9-A (Roll 101 - 105)
            { rollNum: 101, name: 'Aarav Patel', className: 'Class 9-A', marks: { MTH901: 88, ENG901: 82 } },
            { rollNum: 102, name: 'Ananya Deshmukh', className: 'Class 9-A', marks: { MTH901: 94, ENG901: 90 } },
            { rollNum: 103, name: 'Rohan Gupta', className: 'Class 9-A', marks: { MTH901: 76, ENG901: 78 } },
            { rollNum: 104, name: 'Isha Sen', className: 'Class 9-A', marks: { MTH901: 85, ENG901: 89 } },
            { rollNum: 105, name: 'Kabir Mehta', className: 'Class 9-A', marks: { MTH901: 68, ENG901: 72 } },

            // Class 9-B (Roll 201 - 205)
            { rollNum: 201, name: 'Aditya Nair', className: 'Class 9-B', marks: { SCI902: 91, SST902: 86 } },
            { rollNum: 202, name: 'Diya Chatterjee', className: 'Class 9-B', marks: { SCI902: 84, SST902: 92 } },
            { rollNum: 203, name: 'Siddharth Rao', className: 'Class 9-B', marks: { SCI902: 79, SST902: 75 } },
            { rollNum: 204, name: 'Meera Joshi', className: 'Class 9-B', marks: { SCI902: 95, SST902: 89 } },
            { rollNum: 205, name: 'Arjun Reddy', className: 'Class 9-B', marks: { SCI902: 72, SST902: 70 } },

            // Class 10-A (Roll 301 - 305)
            { rollNum: 301, name: 'Tanvi Kulkarni', className: 'Class 10-A', marks: { MTH101: 96, SCI101: 94 } },
            { rollNum: 302, name: 'Vivaan Saxena', className: 'Class 10-A', marks: { MTH101: 82, SCI101: 80 } },
            { rollNum: 303, name: 'Pooja Bhattacharya', className: 'Class 10-A', marks: { MTH101: 90, SCI101: 87 } },
            { rollNum: 304, name: 'Kunal Aggarwal', className: 'Class 10-A', marks: { MTH101: 74, SCI101: 78 } },
            { rollNum: 305, name: 'Riya Iyer', className: 'Class 10-A', marks: { MTH101: 89, SCI101: 93 } },

            // Class 10-B (Roll 401 - 405)
            { rollNum: 401, name: 'Pranav Singhania', className: 'Class 10-B', marks: { CSC102: 95, HND102: 88 } },
            { rollNum: 402, name: 'Sneha Pillai', className: 'Class 10-B', marks: { CSC102: 88, HND102: 91 } },
            { rollNum: 403, name: 'Manish Pandey', className: 'Class 10-B', marks: { CSC102: 78, HND102: 82 } },
            { rollNum: 404, name: 'Neha Chauhan', className: 'Class 10-B', marks: { CSC102: 85, HND102: 89 } },
            { rollNum: 405, name: 'Yashvardhan Jain', className: 'Class 10-B', marks: { CSC102: 92, HND102: 85 } }
        ];

        const studentMap = {};

        for (const st of studentsData) {
            const sclassDoc = sclassMap[st.className];
            if (!sclassDoc) {
                throw new Error(`Reference validation failed for student ${st.name}: Class '${st.className}' missing.`);
            }

            const classSubCodes = Object.keys(st.marks);
            const sub1 = subjectMap[classSubCodes[0]];
            const sub2 = subjectMap[classSubCodes[1]];
            if (!sub1 || !sub2) {
                throw new Error(`Reference validation failed for student ${st.name}: Subject '${classSubCodes[0]}' or '${classSubCodes[1]}' missing.`);
            }

            const expectedAttendance = [
                { date: new Date('2026-10-12'), status: 'Present', subName: sub1._id },
                { date: new Date('2026-10-14'), status: 'Present', subName: sub2._id },
                { date: new Date('2026-10-19'), status: (st.rollNum % 3 === 0) ? 'Absent' : 'Present', subName: sub1._id },
                { date: new Date('2026-10-21'), status: 'Present', subName: sub2._id }
            ];

            const expectedExamResult = [
                { subName: sub1._id, marksObtained: st.marks[classSubCodes[0]] },
                { subName: sub2._id, marksObtained: st.marks[classSubCodes[1]] }
            ];

            let student = await Student.findOne({ rollNum: st.rollNum, sclassName: sclassDoc._id, school: schoolId });

            if (!student) {
                student = await Student.create({
                    name: st.name,
                    rollNum: st.rollNum,
                    password: studentPassword,
                    role: 'Student',
                    sclassName: sclassDoc._id,
                    school: schoolId,
                    examResult: expectedExamResult,
                    attendance: expectedAttendance
                });
                stats.students.inserted++;
                stats.studentAttendance.added += expectedAttendance.length;
            } else {
                let studentModified = false;

                for (const att of expectedAttendance) {
                    const alreadyExists = student.attendance.some(a =>
                        a.subName.toString() === att.subName.toString() &&
                        new Date(a.date).toDateString() === new Date(att.date).toDateString()
                    );
                    if (!alreadyExists) {
                        student.attendance.push(att);
                        studentModified = true;
                        stats.studentAttendance.added++;
                    } else {
                        stats.studentAttendance.existing++;
                    }
                }

                for (const exam of expectedExamResult) {
                    const examExists = student.examResult.some(e =>
                        e.subName.toString() === exam.subName.toString()
                    );
                    if (!examExists) {
                        student.examResult.push(exam);
                        studentModified = true;
                    }
                }

                if (studentModified) {
                    await student.save();
                }
                stats.students.reused++;
            }

            studentMap[st.rollNum] = student;
        }

        // 6. Notices (3 Academic Notices)
        const noticesData = [
            {
                title: 'Annual Science & Robotics Exhibition 2026',
                details: 'All students from Classes 9 and 10 are invited to submit project abstracts for the upcoming Annual Science and Robotics Exhibition. Submissions close on November 20th.',
                date: new Date('2026-11-01')
            },
            {
                title: 'Term 1 Final Examination Schedule Released',
                details: 'The timetable for Term 1 Final Examinations has been published. Theory exams will commence from December 1st. Please download revision guides from the student portal.',
                date: new Date('2026-11-02')
            },
            {
                title: 'Parent-Teacher Meeting (PTM) Notice',
                details: 'The quarterly Parent-Teacher Meeting is scheduled for this Saturday from 9:00 AM to 1:00 PM. Parents can review academic progress and attendance records with mentors.',
                date: new Date('2026-11-03')
            }
        ];

        for (const n of noticesData) {
            let notice = await Notice.findOne({ title: n.title, school: schoolId });
            if (!notice) {
                await Notice.create({
                    title: n.title,
                    details: n.details,
                    date: n.date,
                    school: schoolId
                });
                stats.notices.inserted++;
            } else {
                stats.notices.reused++;
            }
        }

        // 7. Complaints (3 Specific Student Complaints)
        const studentAarav = studentMap[101];     // Aarav Patel (Class 9-A)
        const studentTanvi = studentMap[301];     // Tanvi Kulkarni (Class 10-A)
        const studentPranav = studentMap[401];    // Pranav Singhania (Class 10-B)

        if (!studentAarav || !studentTanvi || !studentPranav) {
            throw new Error("Complaint reference validation failed: Students with roll numbers 101, 301, or 401 not found.");
        }

        const complaintsData = [
            {
                user: studentAarav._id,
                complaint: 'The projector in the Computer Science Lab is flickering frequently during lab sessions, making it difficult to follow coding exercises.',
                date: new Date('2026-11-02')
            },
            {
                user: studentTanvi._id,
                complaint: 'Requesting additional reference textbooks for Advanced Mathematics in the central library as current copies are fully issued.',
                date: new Date('2026-11-03')
            },
            {
                user: studentPranav._id,
                complaint: 'The water purifier on the second floor science block has low pressure during the afternoon recess.',
                date: new Date('2026-11-04')
            }
        ];

        for (const c of complaintsData) {
            let complain = await Complain.findOne({ complaint: c.complaint, user: c.user, school: schoolId });
            if (!complain) {
                await Complain.create({
                    user: c.user,
                    complaint: c.complaint,
                    date: c.date,
                    school: schoolId
                });
                stats.complaints.inserted++;
            } else {
                stats.complaints.reused++;
            }
        }

        // Summary Output
        console.log("==========================================");
        console.log("        DATABASE SEEDING SUMMARY          ");
        console.log("==========================================");
        console.log(`Classes:             ${stats.classes.inserted} inserted, ${stats.classes.reused} existing`);
        console.log(`Subjects:            ${stats.subjects.inserted} inserted, ${stats.subjects.reused} existing`);
        console.log(`Teachers:            ${stats.teachers.inserted} inserted, ${stats.teachers.reused} existing`);
        console.log(`Students:            ${stats.students.inserted} inserted, ${stats.students.reused} existing`);
        console.log(`Student Attendance:  ${stats.studentAttendance.added} added, ${stats.studentAttendance.existing} already up to date`);
        console.log(`Notices:             ${stats.notices.inserted} inserted, ${stats.notices.reused} existing`);
        console.log(`Complaints:          ${stats.complaints.inserted} inserted, ${stats.complaints.reused} existing`);
        console.log("==========================================\n");

        console.log("🔑 SAMPLE LOGIN CREDENTIALS FOR YOUR DEMO:");
        console.log("------------------------------------------");
        console.log(`Admin:   ${admin.email} (Your registered admin password)`);
        console.log("Teacher: vikram.malhotra@dps.edu.in   / teacher123 (Class 10-A, MTH101)");
        console.log("Teacher: sunita.verma@dps.edu.in      / teacher123 (Class 10-A, SCI101)");
        console.log("Teacher: amitabh.mukherjee@dps.edu.in / teacher123 (Class 9-A,  MTH901)");
        console.log("Student: Name: 'Aarav Patel',    Roll: 101, Password: student123 (Class 9-A)");
        console.log("Student: Name: 'Tanvi Kulkarni', Roll: 301, Password: student123 (Class 10-A)");
        console.log("Student: Name: 'Pranav Singhania', Roll: 401, Password: student123 (Class 10-B)\n");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB Atlas. Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed with error:", err.message || err);
        try {
            await mongoose.disconnect();
        } catch (e) {}
        process.exit(1);
    }
};

seedDatabase();


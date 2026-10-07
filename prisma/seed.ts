import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建默认管理员账号
  const adminPasswordHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      userType: 'admin',
      phone: '13800138000',
      isActive: true,
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });

  console.log('创建管理员账号:', admin);

  // 创建示例教师账号
  const teacherPasswordHash = await bcrypt.hash('123456', 10);
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher001' },
    update: {},
    create: {
      username: 'teacher001',
      passwordHash: teacherPasswordHash,
      name: '张老师',
      userType: 'teacher',
      phone: '13800138001',
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });

  console.log('创建教师账号:', teacher);

  // 创建示例家长账号
  const studentPasswordHash = await bcrypt.hash('123456', 10);
  const student = await prisma.user.upsert({
    where: { username: 'student001' },
    update: {},
    create: {
      username: 'student001',
      passwordHash: studentPasswordHash,
      name: '张三',
      userType: 'student',
      phone: '13800138003',
      parents1: '张父',
      parents2: '张母',
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });
  console.log('创建学生账号:', student);

  // 创建示例课程
  const basketballCourse = await prisma.course.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: '篮球基础班',
      description: '适合6-12岁儿童的篮球基础训练',
      courseType: 'session_card',
      totalSessions: 20,
      durationMonths: 3,
      price: 1200.0,
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });

  const taekwondoCourse = await prisma.course.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: '跆拳道季度卡',
      description: '跆拳道训练季度卡，不限次数',
      courseType: 'month_card',
      durationMonths: 3,
      price: 800.0,
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });

  console.log('创建示例课程:', basketballCourse, taekwondoCourse);

  // 为教师分配课程
  await prisma.courseTeacher.upsert({
    where: {
      courseId_teacherId: {
        courseId: basketballCourse.id,
        teacherId: teacher.id,
      },
    },
    update: {},
    create: {
      courseId: basketballCourse.id,
      teacherId: teacher.id,
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
    },
  });

  await prisma.courseTeacher.upsert({
    where: {
      courseId_teacherId: {
        courseId: taekwondoCourse.id,
        teacherId: teacher.id,
      },
    },
    update: {},
    create: {
      courseId: taekwondoCourse.id,
      teacherId: teacher.id,
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
    },
  });

  console.log('为教师分配课程完成');

  // 为学生报名课程
  const studentCourse = await prisma.courseStudent.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      studentId: student.id,
      courseId: basketballCourse.id,
      totalSessions: 20,
      usedSessions: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90天后
      createdAt: new Date(),
      creatorId: 'init',
      creatorName: 'init',
      updatedAt: new Date(),
      updatorId: 'init',
      updatorName: 'init',
    },
  });

  console.log('为学生报名课程:', studentCourse);

  console.log('数据库初始化完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

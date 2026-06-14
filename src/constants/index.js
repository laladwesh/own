import { placeicon, iitg, swc, cepstrum, spirit, techniche, codingClub, ecell, lotus, nova, techboard, kriti } from "../assets";

import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillMail,
  AiFillHtml5,
  AiFillInstagram,
} from "react-icons/ai";

import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiTailwindcss,
  SiBootstrap,
  SiNodedotjs,
  SiNextdotjs,
  SiExpress,
  SiSocketdotio,
  SiMongodb,
  SiMysql,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiPostman,
  SiArduino,
  SiC,
  SiCplusplus,
  SiOpenai,
  SiNginx,
  SiVirtualbox,
  SiLinux,
  SiFigma,
  SiGraphql,
  SiPrisma,
  SiGoogledrive,
  SiCloudinary,
  SiGithubactions,
  SiFirebase,
  SiRedux,
  SiSentry,
  SiFramer,
  SiRazorpay,
  SiCloudflare,
} from "react-icons/si";

import { FaAws, FaServer } from "react-icons/fa";
import { FaGolang } from "react-icons/fa6";
import { DiCss3 } from "react-icons/di";
import { BiLogoVisualStudio } from "react-icons/bi";

export const resumeLink =
  "https://drive.google.com/file/d/1zj7bmu_I5WhgScijtEwWrV08V6-gIaGr/view?usp=sharing";
export const repoLink = "https://github.com/laladwesh";
export const callToAction = "https://www.linkedin.com/in/avinash-gupta-58171828a/";

export const navLinks = [
  { id: "skills", title: "Skills & Experience" },
  { id: "education", title: "Education" },
  { id: "achievements", title: "Achievements" },
  { id: "githubStats", title: "GitHub Stats" },
  { id: "leetcodeStats", title: "LeetCode Stats" },
  { id: "projects", title: "Projects" },
  { id: "openSource", title: "Open Source" },
  { id: "extraCurricular", title: "Extra Curricular" },
  { id: "contactMe", title: "Contact Me" },
];

export const educationList = [
  {
    id: "education-1",
    icon: iitg,
    title: "Indian Institute of Technology Guwahati",
    degree: "Bachelor of Technology",
    duration: "July 2023 – Present",
    content1: "Major: Electronics and Communication Engineering",
    content2: "Roll No: 230102013",
  },
];

export const achievements = [
  {
    id: "a-1",
    icon: swc,
    event: "SWC Hacktoberfest 2024 | Students' Web Committee, IITG",
    position: "Winner — 1st Place",
    content1: "Ranked 1st in the college-level open-source contribution fest hosted by Students' Web Committee, IIT Guwahati.",
    content2: "Contributed to multiple repositories across the swciitg organisation.",
    content3: "",
    article: "",
    project: "https://github.com/swciitg/bestkc_temp",
  },
  {
    id: "a-2",
    icon: swc,
    event: "SWC Hacktoberfest 2025 | Students' Web Committee, IITG",
    position: "Runner Up — 2nd Place",
    content1: "Secured 2nd position in the college Hacktoberfest as an active open-source maintainer within swciitg.",
    content2: "Reviewed and merged contributions across multiple SWC repositories.",
    content3: "",
    article: "",
    project: "https://github.com/swciitg",
  },
  {
    id: "a-3",
    icon: techboard,
    event: "IITG Bootcamp | Technical Board, IIT Guwahati",
    position: "Second Runner Up — Software Development PS",
    content1: "Secured 2nd Runner Up out of 100+ competing teams at the IITG Bootcamp organised by the Technical Board, IIT Guwahati.",
    content2: "Competed in the Software Development problem statement against 100+ intra-college teams.",
    content3: "",
    article: "",
    project: "https://github.com/laladwesh/laplacechatbot",
  },
  {
    id: "a-4",
    icon: kriti,
    event: "Kriti — Inter Hostel Competition | Technical Board, IIT Guwahati",
    position: "Gold Medal — AI Website Generator (Product Dev PS)",
    content1: "Won the Gold Medal in the Product Development problem statement at Kriti, the Inter Hostel Technical Competition under Technical Board, IIT Guwahati.",
    content2: "Built an AI Website Generator — takes a prompt and generates a complete, one-click deployable website. Full product from ideation to deployment.",
    content3: "",
    article: "",
    project: "https://github.com/Manik2708/kriti-ai-web",
  },
];

export const skills = [
  {
    title: "Programming Languages",
    items: [
      { id: "pl-1", icon: SiC, name: "C" },
      { id: "pl-2", icon: SiCplusplus, name: "C++" },
      { id: "pl-3", icon: SiPython, name: "Python" },
      { id: "pl-4", icon: SiJavascript, name: "JavaScript" },
      { id: "pl-8", icon: SiTypescript, name: "TypeScript" },
      { id: "pl-5", icon: AiFillHtml5, name: "HTML" },
      { id: "pl-6", icon: DiCss3, name: "CSS" },
      { id: "pl-7", icon: FaGolang, name: "Go" },
    ],
  },
  {
    title: "Frameworks & Libraries",
    items: [
      { id: "f-1", icon: SiReact, name: "ReactJS" },
      { id: "f-2", icon: SiNextdotjs, name: "Next.js" },
      { id: "f-3", icon: SiNodedotjs, name: "Node.js" },
      { id: "f-4", icon: SiExpress, name: "Express.js" },
      { id: "f-5", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "f-6", icon: SiBootstrap, name: "Bootstrap" },
      { id: "f-7", icon: SiOpenai, name: "OpenAI / Groq" },
      { id: "f-8", icon: SiArduino, name: "Arduino" },
      { id: "f-9", icon: SiSocketdotio, name: "Socket.io" },
      { id: "f-10", icon: SiGraphql, name: "GraphQL" },
      { id: "f-11", icon: SiPrisma, name: "Prisma" },
    ],
  },
  {
    title: "Tools & Platforms",
    items: [
      { id: "t-1", icon: SiMongodb, name: "MongoDB" },
      { id: "t-2", icon: SiMysql, name: "MySQL" },
      { id: "t-3", icon: SiDocker, name: "Docker" },
      { id: "t-4", icon: SiKubernetes, name: "Kubernetes" },
      { id: "t-5", icon: FaAws, name: "AWS" },
      { id: "t-6", icon: SiGit, name: "Git" },
      { id: "t-7", icon: AiFillGithub, name: "GitHub" },
      { id: "t-8", icon: SiPostman, name: "Postman" },
      { id: "t-9", icon: BiLogoVisualStudio, name: "VS Code" },
      { id: "t-10", icon: SiNginx, name: "Nginx" },
      { id: "t-11", icon: SiVirtualbox, name: "Oracle VM" },
      { id: "t-12", icon: FaServer, name: "PM2" },
      { id: "t-13", icon: SiRedis, name: "Redis" },
      { id: "t-14", icon: SiLinux, name: "Linux" },
      { id: "t-15", icon: SiFigma, name: "Figma" },
    ],
  },
];

export const experiences = [
  {
    organisation: "Centre for Career Development, IIT Guwahati",
    logo: iitg,
    link: "https://www.iitg.ac.in/ccd/",
    positions: [
      {
        title: "Lead Student Coordinator",
        duration: "Mar 2026 – Present",
        content: [
          {
            text: "Managing all CCD portals, server infrastructure and technical operations for the Centre for Career Development, IIT Guwahati — overseeing 10+ live platforms and ensuring uptime during critical timings.",
            link: "https://iitg.ac.in/dday/team",
          },
        ],
      },
      {
        title: "Software Developer Intern (Summer)",
        duration: "May 2026 – Jun 2026",
        content: [
          {
            text: "Developing a centralised CCD Internship Portal to automate the complete internship lifecycle for multiple stakeholders — students, coordinators, admin, logistics and verifiers.",
            link: "https://iitg.ac.in/intern",
          },
        ],
      },
      {
        title: "Student Coordinator",
        duration: "Sept 2025 – Feb 2026",
        content: [
          {
            text: "Built and Dockerized the D-Day Live Placement Portal — real-time WebSocket dashboard with role-based access (admin/POC/student), PDF generation, interview slot management, and auto-blocking of placed students; deployed on IITG servers via SSH, supporting 150+ POCs and 1500+ students.",
            link: "https://iitg.ac.in/dday",
          },
        ],
      },
    ],
  },
  {
    organisation: "Sera Innovation",
    logo: placeicon,
    link: "",
    positions: [
      {
        title: "AI Engineer Intern",
        duration: "Dec 2025 – Jan 2026",
        content: [
          {
            text: "Designed a 16-table normalised schema on GCP BigQuery & ArcadeDB and built a PPT Extractor pipeline using the Groq API to auto-map investor pitch deck text to structured schema fields.",
            link: "",
          },
        ],
      },
    ],
  },
  {
    organisation: "Novamatrixz",
    logo: nova,
    link: "",
    positions: [
      {
        title: "Back End Developer Intern",
        duration: "Jun 2025 – Jul 2025",
        content: [
          {
            text: "Built the backend from scratch using Node.js, Express and MongoDB — data structures, API endpoints, secure auth, tests and documentation delivered in an agile environment.",
            link: "",
          },
        ],
      },
    ],
  },
  {
    organisation: "Spirit, IIT Guwahati",
    logo: spirit,
    link: "",
    positions: [
      {
        title: "Web Operations Head",
        duration: "Apr 2025 – Dec 2025",
        content: [
          {
            text: "Managed all web operations for Spirit, IITG's annual sports fest — from development to live deployment, handling both frontend and backend.",
            link: "https://spiritiitg.in/",
          },
        ],
      },
    ],
  },
  {
    organisation: "Lotus Traders, Guwahati",
    logo: lotus,
    link: "",
    positions: [
      {
        title: "Full-Stack Developer Intern",
        duration: "Jan 2025 – Mar 2025",
        content: [
          {
            text: "Built and deployed a full-stack website using Next.js and MongoDB, managing both frontend and backend development end-to-end.",
            link: "https://lotustraders.co.in/",
          },
          {
            text: "Developed a secure admin panel; scaled the platform to handle 30K+ monthly users and ~200 customer queries per day.",
            link: "",
          },
        ],
      },
    ],
  },
  // {
  //   organisation: "Shivalik Graphics, Delhi",
  //   logo: placeicon,
  //   link: "",
  //   positions: [
  //     {
  //       title: "Web Developer Intern",
  //       duration: "Dec 2024 – Jan 2025",
  //       content: [
  //         {
  //           text: "Developed and deployed the complete company website end-to-end for this Delhi-based graphics and printing firm.",
  //           link: "",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    organisation: "Students' Web Committee, IIT Guwahati",
    logo: swc,
    link: "https://swciitg.in",
    positions: [
      {
        title: "Senior Web Developer",
        duration: "Apr 2025 – Mar 2026",
        content: [
          {
            text: "Led backend development and platform maintenance across IITG's student web infrastructure as a senior member of the Students' Web Committee.",
            link: "https://swc.iitg.ac.in",
          },
        ],
      },
      {
        title: "Web Developer",
        duration: "Aug 2024 – Apr 2025",
        content: [
          {
            text: "Developed and maintained SWC portals — built features, fixed bugs and contributed to the backend infrastructure serving the IITG student community.",
            link: "",
          },
        ],
      },
      {
        title: "Junior Growth Manager",
        duration: "Apr 2024 – Aug 2024",
        content: [
          {
            text: "Contributed to platform growth and UI improvements across SWC portals, onboarding as a new member of the committee.",
            link: "",
          },
        ],
      },
    ],
  },
  {
    organisation: "Cepstrum, IIT Guwahati",
    logo: cepstrum,
    link: "",
    positions: [
      {
        title: "Web Operations Mentor",
        duration: "Jun 2026 – Present",
        content: [
          {
            text: "Mentoring the current web team for Cepstrum, guiding architecture decisions, code reviews and deployment strategy for IITG's annual technical festival.",
            link: "",
          },
        ],
      },
      {
        title: "Web Operations Head",
        duration: "Jun 2025 – Jun 2026",
        content: [
          {
            text: "Led the web team end-to-end for Cepstrum — built and shipped the festival's complete web platform using the MERN stack, managing a team of developers.",
            link: "https://iitg.ac.in/cepstrum",
          },
        ],
      },
      {
        title: "Web Developer Executive",
        duration: "Aug 2024 – Jun 2025",
        content: [
          {
            text: "Built and maintained Cepstrum's web infrastructure from scratch as a core developer on the team.",
            link: "",
          },
        ],
      },
    ],
  },
];

export const projects = [
  {
    id: "project-1",
    title: "Intern Portal CCD, IITG",
    github: "https://github.com/tnp-iitg/Intern-Portal-IITG/tree/dev/",
    link: "https://iitg.ac.in/intern",
    image: placeicon,
    content:
      "Full-stack internship management portal for IIT Guwahati's CCD workflow — replaces fragmented manual coordination with a unified platform for students, companies, coordinators, verifiers and logistics. Features Google OAuth, Microsoft/Outlook auth, JWT company login, PDF/Excel exports, CV verification, bulk uploads, role-based access, and Sentry monitoring.",
    stack: [
      { id: "p1-1", icon: SiReact, name: "React" },
      { id: "p1-2", icon: SiRedux, name: "Redux Toolkit" },
      { id: "p1-3", icon: SiNodedotjs, name: "Node.js" },
      { id: "p1-4", icon: SiMongodb, name: "MongoDB" },
      { id: "p1-5", icon: SiExpress, name: "Express.js" },
      { id: "p1-6", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "p1-7", icon: SiDocker, name: "Docker" },
      { id: "p1-8", icon: SiNginx, name: "Nginx" },
      { id: "p1-9", icon: SiGithubactions, name: "GitHub Actions" },
      { id: "p1-10", icon: SiSentry, name: "Sentry" },
    ],
  },
  {
    id: "project-nufab",
    title: "Nufab India — E-Commerce Platform",
    github: "https://github.com/laladwesh/client",
    link: "https://nufab.studio",
    image: placeicon,
    content:
      "Freelance full-stack e-commerce and operations platform for Nufab India — product browsing, cart, wishlist, coupons, checkout, order and refund management, Razorpay payments, Delhivery logistics (tracking, returns, exchanges), AWS S3 image storage, Google OAuth + OTP login, and an AdminJS dashboard for complete backend operations.",
    stack: [
      { id: "pnf-1", icon: SiReact, name: "React" },
      { id: "pnf-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "pnf-3", icon: SiMongodb, name: "MongoDB" },
      { id: "pnf-4", icon: SiExpress, name: "Express.js" },
      { id: "pnf-5", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "pnf-6", icon: SiFramer, name: "Framer Motion" },
      { id: "pnf-7", icon: SiRazorpay, name: "Razorpay" },
      { id: "pnf-8", icon: FaAws, name: "AWS S3" },
      { id: "pnf-9", icon: SiCloudinary, name: "Cloudinary" },
      { id: "pnf-10", icon: SiCloudflare, name: "Cloudflare" },
      { id: "pnf-11", icon: FaServer, name: "Render" },
    ],
  },
  {
    id: "project-copychecker",
    title: "PIMS Evalu Pro",
    github: "https://github.com/laladwesh/copy-checker/",
    link: "https://prasadacademic.in/",
    image: placeicon,
    content:
      "Freelance exam copy management platform — converts uploaded PDFs to per-page images, generates processed PDFs, and syncs with Google Drive. Features Google OAuth + JWT auth, role-based examiner workflows, scheduled maintenance with node-cron, and Cloudinary/Firebase integrations.",
    stack: [
      { id: "pcc-1", icon: SiReact, name: "React" },
      { id: "pcc-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "pcc-3", icon: SiMongodb, name: "MongoDB" },
      { id: "pcc-4", icon: SiExpress, name: "Express.js" },
      { id: "pcc-5", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "pcc-6", icon: SiGoogledrive, name: "Google Drive" },
      { id: "pcc-7", icon: SiDocker, name: "Docker" },
      { id: "pcc-8", icon: SiNginx, name: "Nginx" },
      { id: "pcc-9", icon: SiVirtualbox, name: "Oracle VM" },
      { id: "pcc-10", icon: SiGithubactions, name: "GitHub Actions" },
    ],
  },
  {
    id: "project-elective",
    title: "Elective Enrollment Portal",
    github: "https://github.com/laladwesh/elective-portal",
    link: "https://elective.prasadacademic.in/",
    image: placeicon,
    content:
      "Full-stack elective course enrollment portal built for Prasad Academics — Google OAuth + JWT auth, role-based dashboards (Student/Admin), auto-activation of enrollment windows, bulk student upload via CSV/Excel, and PDF/Excel report generation with capacity management and batch-wise filtering.",
    stack: [
      { id: "pe-1", icon: SiReact, name: "React" },
      { id: "pe-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "pe-3", icon: SiMongodb, name: "MongoDB" },
      { id: "pe-4", icon: SiExpress, name: "Express.js" },
      { id: "pe-5", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "pe-6", icon: SiNginx, name: "Nginx" },
      { id: "pe-7", icon: SiVirtualbox, name: "Oracle VM" },
      { id: "pe-8", icon: SiDocker, name: "Docker" },
      { id: "pe-9", icon: SiGithubactions, name: "GitHub Actions" },
    ],
  },
  {
    id: "project-easeexit",
    title: "EaseExit — Leave Management",
    github: "https://github.com/laladwesh/college-leave-backend",
    link: "https://easeexit.prasadacademic.in",
    playStore: "https://play.google.com/store/apps/details?id=com.pims.pims_app",
    appStore: "https://apps.apple.com/app/ease-exit/id6749087386",
    image: placeicon,
    content:
      "Digitized end-to-end leave management system built for Prasad Academics (PIMS), replacing a paper-based process — role-based access for students, parents, wardens, guards and admins; multi-level approvals, document uploads, email and push notifications, and report exports. Deployed on web, Android (Play Store) and iOS (App Store).",
    stack: [
      { id: "pex-1", icon: SiReact, name: "React / RN" },
      { id: "pex-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "pex-3", icon: SiMongodb, name: "MongoDB" },
      { id: "pex-4", icon: SiExpress, name: "Express.js" },
      { id: "pex-5", icon: SiFirebase, name: "Firebase" },
      { id: "pex-6", icon: SiDocker, name: "Docker" },
      { id: "pex-7", icon: SiNginx, name: "Nginx" },
      { id: "pex-8", icon: SiVirtualbox, name: "Oracle VM" },
      { id: "pex-9", icon: SiGithubactions, name: "GitHub Actions" },
    ],
  },
  {
    id: "project-status",
    title: "Status & Infra Monitor",
    github: "https://github.com/laladwesh/status",
    link: "https://status.prasadacademic.in",
    image: placeicon,
    content:
      "Production-ready service status and infrastructure monitoring platform built for Prasad Academics (PIMS) — public dashboard with live health checks, incident tracking, WebSocket-powered real-time metrics, Prometheus-style endpoints, email alerts on threshold breaches, JWT-secured admin panel, and automated MongoDB backups to Google Drive for disaster recovery.",
    stack: [
      { id: "ps-1", icon: SiReact, name: "React" },
      { id: "ps-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "ps-3", icon: SiMongodb, name: "MongoDB" },
      { id: "ps-4", icon: SiExpress, name: "Express.js" },
      { id: "ps-5", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "ps-6", icon: SiSocketdotio, name: "WebSockets" },
      { id: "ps-7", icon: SiGoogledrive, name: "Google Drive" },
      { id: "ps-8", icon: SiNginx, name: "Nginx" },
      { id: "ps-9", icon: SiVirtualbox, name: "Oracle VM" },
    ],
  },
  {
    id: "project-dday",
    title: "D-Day Live Placement Portal",
    github: "https://github.com/laladwesh/live-placement-ccd/",
    link: "https://iitg.ac.in/dday",
    image: placeicon,
    content:
      "Real-time campus placement portal for IIT Guwahati — WebSocket-enabled live dashboards with role-based access (Admin/POC/Student), JWT auth, PDF report generation, intelligent student blocking to prevent duplicate offers, and bulk CSV/XLSX import. Supports 1500+ students and 150+ companies.",
    stack: [
      { id: "pd-1", icon: SiReact, name: "React" },
      { id: "pd-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "pd-3", icon: SiMongodb, name: "MongoDB" },
      { id: "pd-4", icon: SiSocketdotio, name: "Socket.io" },
      { id: "pd-5", icon: SiDocker, name: "Docker" },
      { id: "pd-6", icon: SiTailwindcss, name: "Tailwind CSS" },
    ],
  },
  {
    id: "project-2",
    title: "Lotus Traders Website",
    github: "",
    link: "",
    image: placeicon,
    content:
      "Full-stack commercial website built with Next.js and MongoDB. Includes a secure admin panel and serves 30K+ monthly users with 200+ daily customer queries.",
    stack: [
      { id: "p2-1", icon: SiNextdotjs, name: "Next.js" },
      { id: "p2-2", icon: SiMongodb, name: "MongoDB" },
      { id: "p2-3", icon: SiTailwindcss, name: "Tailwind CSS" },
    ],
  },
  {
    id: "project-3",
    title: "SWC One-Stop Portal",
    github: "https://github.com/swciitg/one-stop-2021",
    link: "",
    image: placeicon,
    content:
      "Multi-service student platform for IIT Guwahati. Developed and maintained as a core contributor and maintainer within the Students' Web Committee.",
    stack: [
      { id: "p3-1", icon: SiReact, name: "React" },
      { id: "p3-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "p3-3", icon: SiMongodb, name: "MongoDB" },
    ],
  },
  {
    id: "project-4",
    title: "PPT Extractor Pipeline",
    github: "",
    link: "",
    image: placeicon,
    content:
      "AI pipeline built at Sera Innovation that uses the Groq API to parse investor pitch decks and auto-map extracted text to a structured 16-table schema on GCP BigQuery and ArcadeDB.",
    stack: [
      { id: "p4-1", icon: SiPython, name: "Python" },
      { id: "p4-2", icon: SiOpenai, name: "Groq API" },
    ],
  },
  {
    id: "project-5",
    title: "IACCC Conference Website",
    github: "",
    link: "",
    image: placeicon,
    content:
      "Sole developer for the International Conference on Agriculture Centric Computation website — handled full-stack development, deployment and maintenance independently.",
    stack: [
      { id: "p5-1", icon: SiReact, name: "React" },
      { id: "p5-2", icon: SiNodedotjs, name: "Node.js" },
      { id: "p5-3", icon: SiMongodb, name: "MongoDB" },
      { id: "p5-4", icon: SiTailwindcss, name: "Tailwind CSS" },
    ],
  },
  {
    id: "project-onawie",
    title: "Onawie — Mini PaaS",
    github: "https://github.com/laladwesh/place-gfaad",
    link: "https://onawie.avinashgupta.in",
    image: placeicon,
    content:
      "Self-hosted mini PaaS inspired by Vercel/Render — sign in with GitHub OAuth, select a repo, configure build settings, and ship to a live subdomain in one flow. Runs a Docker-based deployment pipeline with webhook-triggered redeploys, PR preview environments, deployment logs, rollbacks, project-level env variables, GitHub commit status updates, encrypted token storage, and optional Gemini-powered deployment insights. Hosted on Oracle VM, managed with PM2, routed via NGINX.",
    stack: [
      { id: "pow-1", icon: SiNextdotjs, name: "Next.js" },
      { id: "pow-2", icon: SiTypescript, name: "TypeScript" },
      { id: "pow-3", icon: SiExpress, name: "Express.js" },
      { id: "pow-4", icon: SiDocker, name: "Docker" },
      { id: "pow-5", icon: SiNginx, name: "Nginx" },
      { id: "pow-6", icon: SiMongodb, name: "MongoDB" },
      { id: "pow-7", icon: SiRedis, name: "Redis" },
      { id: "pow-8", icon: AiFillGithub, name: "GitHub OAuth" },
      { id: "pow-9", icon: SiVirtualbox, name: "Oracle VM" },
      { id: "pow-10", icon: FaServer, name: "PM2" },
    ],
  },
  {
    id: "project-gt",
    title: "Prof. Gaurav Trivedi Portfolio",
    github: "https://github.com/laladwesh/gt",
    link: "https://iitg.ac.in/trivedi",
    image: placeicon,
    content:
      "Editable academic portfolio for Prof. Gaurav Trivedi with a React frontend and AdminJS CMS — showcases publications, projects, students and downloadable resources with non-technical content management via an authenticated admin panel; no redeployment required.",
    stack: [
      { id: "pgt-1", icon: SiReact, name: "React" },
      { id: "pgt-2", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "pgt-3", icon: SiNodedotjs, name: "Node.js" },
      { id: "pgt-4", icon: SiExpress, name: "Express.js" },
      { id: "pgt-5", icon: SiMongodb, name: "MongoDB" },
      { id: "pgt-6", icon: SiNginx, name: "Nginx" },
      { id: "pgt-7", icon: FaServer, name: "Render" },
    ],
  },
];

export const blogPosts = [];

export const stats = [
  { id: "stats-1", title: "Organisations", value: "1+" },
  { id: "stats-2", title: "Repos Maintained", value: "7+" },
  { id: "stats-3", title: "Contributions", value: "50+" },
];

export const extraCurricular = [
  {
    id: 1,
    organisation: "Techniche, IIT Guwahati",
    title: "Core Team Dev-Ops",
    duration: "Nov 2024 – Oct 2025",
    content: [
      {
        text: "Core DevOps team member for Techniche, IITG's annual techno-management festival — managed web infrastructure, CI/CD pipelines and live deployments.",
        link: "",
      },
    ],
    logo: techniche,
  },
  {
    id: 2,
    organisation: "E-Cell, IIT Guwahati",
    title: "Senior Executive",
    duration: "Apr 2024 – Apr 2025",
    content: [
      {
        text: "Senior Executive in E-Cell IITG — contributed to entrepreneurship initiatives, events, and speaker sessions for the student community.",
        link: "",
      },
    ],
    logo: ecell,
  },
  {
    id: 3,
    organisation: "Coding Club, IIT Guwahati",
    title: "Coordinator",
    duration: "Dec 2024 – May 2025",
    content: [
      {
        text: "Coordinated web development workshops and mentored junior students in building full-stack projects.",
        link: "",
      },
    ],
    logo: codingClub,
  },
];

export const socialMedia = [
  {
    id: "social-media-1",
    icon: AiFillLinkedin,
    link: "https://www.linkedin.com/in/avinash-gupta-58171828a/",
  },
  {
    id: "social-media-2",
    icon: AiFillGithub,
    link: "https://www.github.com/laladwesh",
  },
  {
    id: "social-media-3",
    icon: AiFillMail,
    link: "mailto:guptaavinash302@gmail.com",
  },
  {
    id: "social-media-4",
    icon: AiFillInstagram,
    link: "https://www.instagram.com/chholekulche_",
  },
];

export const aboutMe = {
  name: "Avinash Gupta",
  githubUsername: "laladwesh",
  tagLine:
    "Software Dev @ CCD, IITG | Full-Stack & AI Engineer | ECE'27 | Open Source",
  intro:
    "Electronics & Communication Engineering student at IIT Guwahati who loves building scalable web applications and exploring AI. Always looking for the next problem worth solving.",
};

export const itemsToFetch = 20;

export const includedRepos = [
  "swciitg/one-stop-2021",
  "swciitg/Freshers_Portal",
  "swciitg/Welfare_Board_Portal",
  "swciitg/Sports_Board_Portal",
  "tnp-iitg/CCD-App-backend",
];

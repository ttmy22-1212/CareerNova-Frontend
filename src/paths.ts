export const paths = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    verifyRequest: "/auth/verify-request",
  },
  emailVerified: "/email-verified",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  personalDashboard: "/my-dashboard",
  profile: {
    detail: "/profile",
  },
  career: {
    index: "/careers",
    detail: "/careers/:careerId",
  },
  jobs: {
    index: "/jobs",
    detail: "/jobs/:jobId",
  },
  cvMatching: "/cv-matching",
  skillGap: "/skill-gap",
  recommendations: "/recommendations",
  forum: "/forum",
  roadmap: {
    index: "/roadmap",
    detail: "/roadmap/:roadmapId",
  },

  admin: {
    dashboard: "/admin/dashboard",
    company: "/admin/company",
    career: "/admin/career",
    user: "/admin/user",
    roadmap: {
      index: "/admin/roadmap",
      detail: "/admin/roadmap/[roadmapId]",
      create: "/admin/roadmap/create",
    },
  },
  404: "/not-found",
};

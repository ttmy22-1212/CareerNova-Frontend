import * as Yup from "yup";

export enum TopicType {
  course = "Course",
  article = "Article",
  video = "Video",
  book = "Book",
  project = "Project",
  interview = "Interview",
  resource = "Resource",
  other = "Other",
}

export interface Topic {
  id: string;
  title: string;
  level: number;
  parent_id: string | null;
  description: string | null;
  priority: number | null;
  order: number | null;
  resources:
    | {
        title: string | null;
        type: TopicType;
        url: string | null;
      }[]
    | null;
  created_at: string;
  updated_at: string;
}

export const resourceValidateSchema = Yup.object().shape({
  title: Yup.string().nullable(),
  type: Yup.mixed<TopicType>()
    .oneOf(Object.values(TopicType))
    .required("Loại là bắt buộc"),
  url: Yup.string().url("URL không hợp lệ").nullable(),
});

export const topicValidateSchema = Yup.object().shape({
  title: Yup.string().required("Tiêu đề là bắt buộc"),
  priority: Yup.number().nullable(),
  order: Yup.number().nullable(),
  resources: Yup.array().of(resourceValidateSchema).min(1),
  level: Yup.number().nullable(),
});

export const initialValuesTopic = {
  title: "",
  priority: null,
  order: null,
  description: "",
  resources: [
    {
      title: "",
      type: TopicType.other,
      url: "",
    },
  ],
};

// Mock data based on the Topic model
export const MOCK_TOPICS = [
  {
    id: "1",
    title: "Frontend Development",
    level: 1,
    parent_id: null,
    description: "Learn the fundamentals of frontend development",
    priority: 1,
    resources: [
      {
        title: "HTML & CSS Basics",
        type: TopicType.course,
        url: "https://example.com/html-css",
      },
      {
        title: "JavaScript Fundamentals",
        type: TopicType.video,
        url: "https://example.com/js-fundamentals",
      },
    ],
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-04-20T14:45:00Z",
  },
  {
    id: "2",
    title: "HTML & CSS",
    level: 2,
    parent_id: "1",
    description: "Master HTML and CSS for web development",
    priority: 1,
    resources: [
      {
        title: "HTML5 Guide",
        type: TopicType.book,
        url: "https://example.com/html5-guide",
      },
      {
        title: "CSS Flexbox Tutorial",
        type: TopicType.article,
        url: "https://example.com/flexbox",
      },
    ],
    created_at: "2023-01-20T11:15:00Z",
    updated_at: "2023-04-22T09:30:00Z",
  },
  {
    id: "3",
    title: "JavaScript",
    level: 2,
    parent_id: "1",
    description: "Learn JavaScript programming language",
    priority: 2,
    resources: [
      {
        title: "JavaScript: The Good Parts",
        type: TopicType.book,
        url: "https://example.com/js-good-parts",
      },
      {
        title: "Modern JavaScript Tutorial",
        type: TopicType.course,
        url: "https://example.com/modern-js",
      },
    ],
    created_at: "2023-01-25T14:20:00Z",
    updated_at: "2023-04-25T16:40:00Z",
  },
  {
    id: "4",
    title: "Backend Development",
    level: 1,
    parent_id: null,
    description: "Learn server-side programming and databases",
    priority: 2,
    resources: [
      {
        title: "Node.js Fundamentals",
        type: TopicType.course,
        url: "https://example.com/nodejs",
      },
      {
        title: "Database Design",
        type: TopicType.article,
        url: "https://example.com/db-design",
      },
    ],
    created_at: "2023-02-05T09:45:00Z",
    updated_at: "2023-05-10T11:20:00Z",
  },
  {
    id: "5",
    title: "Node.js",
    level: 2,
    parent_id: "4",
    description: "Master Node.js for backend development",
    priority: 1,
    resources: [
      {
        title: "Node.js in Action",
        type: TopicType.book,
        url: "https://example.com/nodejs-book",
      },
      {
        title: "Building RESTful APIs",
        type: TopicType.video,
        url: "https://example.com/rest-apis",
      },
    ],
    created_at: "2023-02-10T13:30:00Z",
    updated_at: "2023-05-15T10:15:00Z",
  },
];

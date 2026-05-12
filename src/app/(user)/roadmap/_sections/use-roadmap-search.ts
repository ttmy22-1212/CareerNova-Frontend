"use client"

import { useTopicContext } from "@/contexts/topic/topic-context"
import { useEffect, useMemo } from "react"


// Gọi API và cache dữ liệu topics
export function useRoadmapSearch() {
  const { getTopicsApi } = useTopicContext()

  useEffect(() => {
    getTopicsApi.call({ limit: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const topics = useMemo(() => getTopicsApi.data?.data || [], [getTopicsApi.data])
  const topicLevel1 = topics.filter((topic) => topic.level === 1)
  
  return {
    topics,
    topicLevel1,
  }
}




// export interface Resource {
//   id: string
//   title: string
//   type: "Course" | "Article" | "Video" | "Book" | "Project" | "Interview" | "Resource" | "Other"
//   url: string
//   platform?: string
//   free?: boolean
//   duration?: string
// }

// export interface Topic {
//   id: string
//   title: string
//   level: number
//   description: string
//   priority: number
//   resources: Resource[]
//   order: number
//   parent_id: string | null
//   children?: Topic[] // For building the hierarchy
// }

// export type TopicWithResources = Topic

// // Mock database of topics
// const topicsData: Topic[] = [
//   // Frontend Roadmap (Level 1)
//   {
//     id: "frontend",
//     title: "Frontend Developer",
//     level: 1,
//     description: "Step by step guide to becoming a modern frontend developer in 2025",
//     priority: 1,
//     resources: [],
//     order: 1,
//     parent_id: null,
//   },
//   // HTML (Level 2 - child of Frontend)
//   {
//     id: "html",
//     title: "HTML",
//     level: 2,
//     description: "Learn the basics of HTML, the markup language used to structure web content.",
//     priority: 1,
//     resources: [
//       {
//         id: "html-1",
//         title: "HTML Crash Course For Absolute Beginners",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
//         platform: "YouTube",
//         free: true,
//         duration: "1 hour",
//       },
//       {
//         id: "html-2",
//         title: "HTML5 and CSS Fundamentals",
//         type: "Course",
//         url: "https://www.edx.org/course/html5-and-css-fundamentals",
//         platform: "edX",
//         free: true,
//         duration: "6 weeks",
//       },
//     ],
//     order: 1,
//     parent_id: "frontend",
//   },
//   // HTML Basics (Level 3 - child of HTML)
//   {
//     id: "html-basics",
//     title: "HTML Basics",
//     level: 3,
//     description: "Learn the fundamental HTML elements and structure.",
//     priority: 1,
//     resources: [
//       {
//         id: "html-basics-1",
//         title: "HTML Elements Reference",
//         type: "Resource",
//         url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
//         platform: "MDN",
//         free: true,
//       },
//     ],
//     order: 1,
//     parent_id: "html",
//   },
//   // HTML Forms (Level 3 - child of HTML)
//   {
//     id: "html-forms",
//     title: "HTML Forms",
//     level: 3,
//     description: "Learn how to create interactive forms in HTML.",
//     priority: 2,
//     resources: [
//       {
//         id: "html-forms-1",
//         title: "HTML Forms Tutorial",
//         type: "Article",
//         url: "https://www.w3schools.com/html/html_forms.asp",
//         platform: "W3Schools",
//         free: true,
//       },
//     ],
//     order: 2,
//     parent_id: "html",
//   },
//   // CSS (Level 2 - child of Frontend)
//   {
//     id: "css",
//     title: "CSS",
//     level: 2,
//     description: "Learn CSS to style and layout web pages with responsive design principles.",
//     priority: 2,
//     resources: [
//       {
//         id: "css-1",
//         title: "CSS Crash Course For Absolute Beginners",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
//         platform: "YouTube",
//         free: true,
//         duration: "1.5 hours",
//       },
//     ],
//     order: 2,
//     parent_id: "frontend",
//   },
//   // CSS Selectors (Level 3 - child of CSS)
//   {
//     id: "css-selectors",
//     title: "CSS Selectors",
//     level: 3,
//     description: "Learn how to select HTML elements to apply styles.",
//     priority: 1,
//     resources: [
//       {
//         id: "css-selectors-1",
//         title: "CSS Selectors Reference",
//         type: "Resource",
//         url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors",
//         platform: "MDN",
//         free: true,
//       },
//     ],
//     order: 1,
//     parent_id: "css",
//   },
//   // JavaScript (Level 2 - child of Frontend)
//   {
//     id: "javascript",
//     title: "JavaScript",
//     level: 2,
//     description: "Learn the fundamentals of JavaScript, the programming language of the web.",
//     priority: 3,
//     resources: [
//       {
//         id: "js-1",
//         title: "JavaScript Crash Course For Beginners",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
//         platform: "YouTube",
//         free: true,
//         duration: "1.5 hours",
//       },
//     ],
//     order: 3,
//     parent_id: "frontend",
//   },
//   // Backend Roadmap (Level 1)
//   {
//     id: "backend",
//     title: "Backend Developer",
//     level: 1,
//     description: "Step by step guide to becoming a modern backend developer in 2025",
//     priority: 2,
//     resources: [],
//     order: 2,
//     parent_id: null,
//   },
//   // Node.js (Level 2 - child of Backend)
//   {
//     id: "nodejs",
//     title: "Node.js",
//     level: 2,
//     description: "Learn server-side JavaScript with Node.js.",
//     priority: 1,
//     resources: [
//       {
//         id: "nodejs-1",
//         title: "Node.js Crash Course",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
//         platform: "YouTube",
//         free: true,
//         duration: "1.5 hours",
//       },
//     ],
//     order: 1,
//     parent_id: "backend",
//   },
//   // Databases (Level 2 - child of Backend)
//   {
//     id: "databases",
//     title: "Databases",
//     level: 2,
//     description: "Learn about different types of databases and how to use them.",
//     priority: 2,
//     resources: [
//       {
//         id: "db-1",
//         title: "SQL Tutorial",
//         type: "Article",
//         url: "https://www.w3schools.com/sql/",
//         platform: "W3Schools",
//         free: true,
//       },
//     ],
//     order: 2,
//     parent_id: "backend",
//   },
//   // DevOps Roadmap (Level 1)
//   {
//     id: "devops",
//     title: "DevOps Engineer",
//     level: 1,
//     description: "Step by step guide to becoming a DevOps engineer in 2025",
//     priority: 3,
//     resources: [],
//     order: 3,
//     parent_id: null,
//   },
//   // Docker (Level 2 - child of DevOps)
//   {
//     id: "docker",
//     title: "Docker",
//     level: 2,
//     description: "Learn containerization with Docker.",
//     priority: 1,
//     resources: [
//       {
//         id: "docker-1",
//         title: "Docker Crash Course",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=pTFZFxd4hOI",
//         platform: "YouTube",
//         free: true,
//         duration: "1 hour",
//       },
//     ],
//     order: 1,
//     parent_id: "devops",
//   },
//   // Level 4 topics
//   // HTML Semantic Elements (Level 4 - child of HTML Basics)
//   {
//     id: "html-semantic",
//     title: "HTML Semantic Elements",
//     level: 4,
//     description:
//       "Learn about semantic HTML elements that clearly describe their meaning to both the browser and developer.",
//     priority: 1,
//     resources: [
//       {
//         id: "html-semantic-1",
//         title: "HTML Semantic Elements Guide",
//         type: "Article",
//         url: "https://www.w3schools.com/html/html5_semantic_elements.asp",
//         platform: "W3Schools",
//         free: true,
//       },
//       {
//         id: "html-semantic-2",
//         title: "Why You Should Use Semantic HTML",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=kGW8Al_cga4",
//         platform: "YouTube",
//         free: true,
//         duration: "12 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "html-basics",
//   },

//   // HTML Tables (Level 4 - child of HTML Basics)
//   {
//     id: "html-tables",
//     title: "HTML Tables",
//     level: 4,
//     description: "Learn how to create and style tables in HTML for displaying tabular data.",
//     priority: 2,
//     resources: [
//       {
//         id: "html-tables-1",
//         title: "HTML Table Basics",
//         type: "Article",
//         url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Basics",
//         platform: "MDN",
//         free: true,
//       },
//       {
//         id: "html-tables-2",
//         title: "Advanced HTML Tables",
//         type: "Course",
//         url: "https://www.linkedin.com/learning/html-tables",
//         platform: "LinkedIn Learning",
//         free: false,
//         duration: "1.5 hours",
//       },
//     ],
//     order: 2,
//     parent_id: "html-basics",
//   },

//   // Form Validation (Level 4 - child of HTML Forms)
//   {
//     id: "form-validation",
//     title: "Form Validation",
//     level: 4,
//     description: "Learn how to validate form inputs using HTML5 attributes and JavaScript.",
//     priority: 1,
//     resources: [
//       {
//         id: "form-validation-1",
//         title: "Client-side form validation",
//         type: "Article",
//         url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation",
//         platform: "MDN",
//         free: true,
//       },
//       {
//         id: "form-validation-2",
//         title: "HTML Form Validation Examples",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=In0nB0ABaUk",
//         platform: "YouTube",
//         free: true,
//         duration: "28 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "html-forms",
//   },

//   // Form Accessibility (Level 4 - child of HTML Forms)
//   {
//     id: "form-accessibility",
//     title: "Form Accessibility",
//     level: 4,
//     description: "Learn how to make your forms accessible to all users, including those with disabilities.",
//     priority: 2,
//     resources: [
//       {
//         id: "form-accessibility-1",
//         title: "Web Forms Accessibility",
//         type: "Article",
//         url: "https://webaim.org/techniques/forms/",
//         platform: "WebAIM",
//         free: true,
//       },
//       {
//         id: "form-accessibility-2",
//         title: "Creating Accessible Forms",
//         type: "Course",
//         url: "https://www.udemy.com/course/web-accessibility-creating-accessible-forms/",
//         platform: "Udemy",
//         free: false,
//         duration: "2 hours",
//       },
//     ],
//     order: 2,
//     parent_id: "html-forms",
//   },

//   // CSS Box Model (Level 4 - child of CSS Selectors)
//   {
//     id: "css-box-model",
//     title: "CSS Box Model",
//     level: 4,
//     description: "Learn about the CSS box model and how it affects layout and spacing.",
//     priority: 1,
//     resources: [
//       {
//         id: "css-box-model-1",
//         title: "The CSS Box Model",
//         type: "Article",
//         url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model",
//         platform: "MDN",
//         free: true,
//       },
//       {
//         id: "css-box-model-2",
//         title: "CSS Box Model Explained",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=rIO5326FgPE",
//         platform: "YouTube",
//         free: true,
//         duration: "15 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "css-selectors",
//   },

//   // CSS Flexbox (Level 4 - child of CSS Selectors)
//   {
//     id: "css-flexbox",
//     title: "CSS Flexbox",
//     level: 4,
//     description: "Learn how to use CSS Flexbox for creating flexible layouts.",
//     priority: 2,
//     resources: [
//       {
//         id: "css-flexbox-1",
//         title: "A Complete Guide to Flexbox",
//         type: "Article",
//         url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
//         platform: "CSS-Tricks",
//         free: true,
//       },
//       {
//         id: "css-flexbox-2",
//         title: "Flexbox in 20 Minutes",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
//         platform: "YouTube",
//         free: true,
//         duration: "20 minutes",
//       },
//       {
//         id: "css-flexbox-3",
//         title: "Flexbox Froggy",
//         type: "Resource",
//         url: "https://flexboxfroggy.com/",
//         platform: "Flexbox Froggy",
//         free: true,
//       },
//     ],
//     order: 2,
//     parent_id: "css-selectors",
//   },

//   // Level 5 topics - Adding these to test the infinite nesting capability

//   // Header Elements (Level 5 - child of HTML Semantic)
//   {
//     id: "header-elements",
//     title: "Header Elements",
//     level: 5,
//     description: "Learn about semantic header elements like header, nav, and h1-h6.",
//     priority: 1,
//     resources: [
//       {
//         id: "header-elements-1",
//         title: "Semantic HTML: Header and Footer",
//         type: "Article",
//         url: "https://www.semrush.com/blog/semantic-html5-guide/#header-and-footer-elements",
//         platform: "Semrush Blog",
//         free: true,
//       },
//       {
//         id: "header-elements-2",
//         title: "HTML5 Semantic Elements: Header",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=QVX0X3UaDMM",
//         platform: "YouTube",
//         free: true,
//         duration: "8 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "html-semantic",
//   },

//   // Content Sectioning (Level 5 - child of HTML Semantic)
//   {
//     id: "content-sectioning",
//     title: "Content Sectioning",
//     level: 5,
//     description: "Learn about semantic elements for content sectioning like article, section, and aside.",
//     priority: 2,
//     resources: [
//       {
//         id: "content-sectioning-1",
//         title: "Content Sectioning in HTML5",
//         type: "Article",
//         url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element#content_sectioning",
//         platform: "MDN",
//         free: true,
//       },
//       {
//         id: "content-sectioning-2",
//         title: "HTML5 Semantic Elements: Article vs Section",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=o3A1WGLvXiE",
//         platform: "YouTube",
//         free: true,
//         duration: "10 minutes",
//       },
//     ],
//     order: 2,
//     parent_id: "html-semantic",
//   },

//   // HTML5 Validation (Level 5 - child of Form Validation)
//   {
//     id: "html5-validation",
//     title: "HTML5 Built-in Validation",
//     level: 5,
//     description: "Learn about HTML5 built-in form validation attributes like required, pattern, and min/max.",
//     priority: 1,
//     resources: [
//       {
//         id: "html5-validation-1",
//         title: "HTML5 Form Validation",
//         type: "Article",
//         url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation",
//         platform: "MDN",
//         free: true,
//       },
//       {
//         id: "html5-validation-2",
//         title: "HTML5 Form Validation Attributes",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=NDNoj8slu_w",
//         platform: "YouTube",
//         free: true,
//         duration: "15 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "form-validation",
//   },

//   // JavaScript Validation (Level 5 - child of Form Validation)
//   {
//     id: "js-validation",
//     title: "JavaScript Form Validation",
//     level: 5,
//     description: "Learn how to validate forms using JavaScript for more complex validation requirements.",
//     priority: 2,
//     resources: [
//       {
//         id: "js-validation-1",
//         title: "JavaScript Form Validation",
//         type: "Article",
//         url: "https://www.w3schools.com/js/js_validation.asp",
//         platform: "W3Schools",
//         free: true,
//       },
//       {
//         id: "js-validation-2",
//         title: "Form Validation with JavaScript",
//         type: "Course",
//         url: "https://www.udemy.com/course/form-validation-with-javascript/",
//         platform: "Udemy",
//         free: false,
//         duration: "2.5 hours",
//       },
//     ],
//     order: 2,
//     parent_id: "form-validation",
//   },

//   // Flexbox Container (Level 5 - child of CSS Flexbox)
//   {
//     id: "flexbox-container",
//     title: "Flexbox Container Properties",
//     level: 5,
//     description: "Learn about flexbox container properties like flex-direction, justify-content, and align-items.",
//     priority: 1,
//     resources: [
//       {
//         id: "flexbox-container-1",
//         title: "Flexbox Container Properties",
//         type: "Article",
//         url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/#aa-properties-for-the-parent-flex-container",
//         platform: "CSS-Tricks",
//         free: true,
//       },
//       {
//         id: "flexbox-container-2",
//         title: "Flexbox Container Deep Dive",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=K74l26pE4YA",
//         platform: "YouTube",
//         free: true,
//         duration: "18 minutes",
//       },
//     ],
//     order: 1,
//     parent_id: "css-flexbox",
//   },

//   // Flexbox Items (Level 5 - child of CSS Flexbox)
//   {
//     id: "flexbox-items",
//     title: "Flexbox Item Properties",
//     level: 5,
//     description: "Learn about flexbox item properties like flex-grow, flex-shrink, and align-self.",
//     priority: 2,
//     resources: [
//       {
//         id: "flexbox-items-1",
//         title: "Flexbox Item Properties",
//         type: "Article",
//         url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/#aa-properties-for-the-children-flex-items",
//         platform: "CSS-Tricks",
//         free: true,
//       },
//       {
//         id: "flexbox-items-2",
//         title: "Mastering Flex Items",
//         type: "Video",
//         url: "https://www.youtube.com/watch?v=4Oi5xpjoCRk",
//         platform: "YouTube",
//         free: true,
//         duration: "22 minutes",
//       },
//     ],
//     order: 2,
//     parent_id: "css-flexbox",
//   },
// ]

// // Function to build the topic hierarchy
// function buildTopicHierarchy(topics: Topic[]): Topic[] {
//   const topLevelTopics: Topic[] = []
//   const topicMap: Record<string, Topic> = {}

//   // First pass: create a map of all topics by ID
//   topics.forEach((topic) => {
//     topicMap[topic.id] = { ...topic, children: [] }
//   })

//   // Second pass: build the hierarchy
//   topics.forEach((topic) => {
//     if (topic.parent_id === null) {
//       // This is a top-level topic
//       topLevelTopics.push(topicMap[topic.id])
//     } else if (topicMap[topic.parent_id]) {
//       // This is a child topic, add it to its parent's children
//       topicMap[topic.parent_id].children = topicMap[topic.parent_id].children || []
//       topicMap[topic.parent_id].children!.push(topicMap[topic.id])
//     }
//   })

//   return topLevelTopics
// }

// // Get all top-level roadmaps (level 1 topics)
// export function getAllRoadmaps(): Topic[] {
//   return topicsData.filter((topic) => topic.level === 1)
// }

// // Get a specific roadmap with its full hierarchy
// export function getRoadmapData(id: string): Topic | undefined {
//   const allTopics = [...topicsData]
//   const roadmap = allTopics.find((topic) => topic.id === id)

//   if (!roadmap) {
//     return undefined
//   }

//   // Build the complete hierarchy for this roadmap by including all descendants
//   // This is a more comprehensive approach that will include all levels (4, 5, etc.)
//   const relevantTopics = allTopics.filter((topic) => {
//     // Include the roadmap itself
//     if (topic.id === id) return true

//     // Find all topics that are descendants of this roadmap
//     let currentTopic = topic
//     let parentId = currentTopic.parent_id

//     // Traverse up the hierarchy until we reach the root or find our target roadmap
//     while (parentId) {
//       if (parentId === id) return true

//       // Move up to the parent
//       const parent = allTopics.find((t) => t.id === parentId)
//       if (!parent) break

//       currentTopic = parent
//       parentId = parent.parent_id
//     }

//     return false
//   })

//   const topicHierarchy = buildTopicHierarchy(relevantTopics)
//   return topicHierarchy[0]
// }

// // Get all topic IDs for generating static paths
// export function getAllTopicIds(): string[] {
//   return topicsData.map((topic) => topic.id)
// }

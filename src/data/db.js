const lessons = [
    {
      id: "1",
      title: "Introduction to GraphQL",
      slug: "intro-graphql",
      fullSlug: "course-1/intro-graphql",
      description: "Learn the basics of GraphQL",
      course: {
        id: "c1",
        name: "GraphQL Basics"
      },
      type: "single",
      parentId: null,
      order: 1,
      content: "This is the content for GraphQL introduction.",
      isPublished: true,
      publishedAt: "2026-03-20",
      isDeleted: false,
      meta: {
        title: "GraphQL Intro",
        description: "Start learning GraphQL",
        keywords: ["graphql", "api", "backend"]
      },
      createdAt: "2026-03-18",
      updatedAt: "2026-03-19"
    },
    {
      id: "2",
      title: "Advanced GraphQL",
      slug: "advanced-graphql",
      fullSlug: "course-1/advanced-graphql",
      description: "Deep dive into GraphQL",
      course: {
        id: "c1",
        name: "GraphQL Basics"
      },
      type: "group",
      parentId: "1",
      order: 2,
      content: "Advanced concepts like resolvers and schema stitching.",
      isPublished: true,
      publishedAt: "2026-03-22",
      isDeleted: false,
      meta: {
        title: "Advanced GraphQL",
        description: "Deep dive",
        keywords: ["graphql", "advanced"]
      },
      createdAt: "2026-03-19",
      updatedAt: "2026-03-21"
    }
  ];

  export default lessons;
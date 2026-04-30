// src/modules/quiz/quiz.resolver.js

import {
    getQuizQuestion,
    getQuizQuestions,
    createQuizQuestionService,
    updateQuizQuestionService,
    deleteQuizQuestionService,
    reorderQuizQuestionService,
  } from './quiz.service.js';
  
  const quizResolver = {
    Query: {
      quizQuestion: (_parent, { id }) => getQuizQuestion(id),
      quizQuestions: (_parent, args) => getQuizQuestions(args),
    },
  
    Mutation: {
      createQuizQuestion: (_parent, { input }) => createQuizQuestionService(input),
      updateQuizQuestion: (_parent, { id, input }) => updateQuizQuestionService(id, input),
      deleteQuizQuestion: (_parent, { id }) => deleteQuizQuestionService(id),
      reorderQuizQuestion: (_parent, { id, order }) => reorderQuizQuestionService(id, order),
    },
  
    QuizQuestion: {
      id: (parent) => parent._id?.toString() ?? parent.id,
  
      // lessonId is stored as lesson (ObjectId ref) in the model
      lessonId: (parent) =>
        parent.lesson?._id?.toString() ?? parent.lesson?.toString() ?? null,
    },
  };
  
  export default quizResolver;
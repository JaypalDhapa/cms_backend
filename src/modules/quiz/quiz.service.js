// src/modules/quiz/quiz.service.js

import {
    findQuizQuestion,
    findQuizQuestions,
    findAllQuizQuestionsByLesson,
    createQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    getLastOrderForLesson,
    getFirstOrderForLesson,
    getOrdersForLesson,
    countQuizQuestionsInLesson,
  } from './quiz.repository.js';
  
  // ── Allowed types ─────────────────────────────────────────────────────────────
  const VALID_TYPES = ['mcq', 'multi_select', 'drag_drop', 'fill_blank'];
  
  // ── Validation ────────────────────────────────────────────────────────────────
  
  function validateQuizInput({ type, question, options, correct, blanks }) {
    if (!VALID_TYPES.includes(type)) {
      throw new Error(
        `Invalid question type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`
      );
    }
  
    if (!question?.trim()) {
      throw new Error('Question text is required');
    }
  
    if (type === 'mcq') {
      if (!options?.length || options.length < 2) {
        throw new Error('MCQ questions require at least 2 options');
      }
      if (options.length > 8) {
        throw new Error('MCQ questions allow a maximum of 8 options');
      }
      if (!correct) throw new Error('MCQ questions require a correct answer');
    }
  
    if (type === 'multi_select') {
      if (!options?.length || options.length < 2) {
        throw new Error('Multi-select questions require at least 2 options');
      }
      if (options.length > 8) {
        throw new Error('Multi-select questions allow a maximum of 8 options');
      }
      if (!correct) throw new Error('Multi-select questions require correct answers');
      const parsed = JSON.parse(correct);
      if (!Array.isArray(parsed) || parsed.length < 1) {
        throw new Error('Multi-select questions require at least one correct answer');
      }
    }
  
    if (type === 'drag_drop') {
      if (!options?.length || options.length < 1) {
        throw new Error('Drag & drop questions require at least 1 chip');
      }
      if (!correct) throw new Error('Drag & drop questions require correct chips');
      const parsed = JSON.parse(correct);
      if (!Array.isArray(parsed) || parsed.length < 1) {
        throw new Error('Drag & drop questions require at least one correct chip');
      }
      // Validate that question contains at least one [blank]
      if (!question.includes('[blank]')) {
        throw new Error('Drag & drop questions must contain at least one [blank] in the question text');
      }
    }
  
    if (type === 'fill_blank') {
      if (!blanks?.length) {
        throw new Error('Fill-in-blank questions require at least one blank');
      }
      for (const blank of blanks) {
        if (!blank.acceptedAnswers?.length) {
          throw new Error('Each blank must have at least one accepted answer');
        }
      }
      if (!question.includes('[blank]')) {
        throw new Error('Fill-in-blank questions must contain at least one [blank] in the question text');
      }
      // Validate blank count matches blanks array length
      const blankCount = (question.match(/\[blank\]/g) || []).length;
      if (blankCount !== blanks.length) {
        throw new Error(
          `Question has ${blankCount} [blank] marker(s) but ${blanks.length} blank answer(s) were provided`
        );
      }
    }
  }
  
  // ── Order calculation ─────────────────────────────────────────────────────────
  
  async function resolveOrder(lessonId, orderInput) {
    // If no order provided — default to last
    if (orderInput == null) {
      const lastOrder = await getLastOrderForLesson(lessonId);
      return lastOrder + 10;
    }
    return orderInput;
  }
  
  // ── Queries ───────────────────────────────────────────────────────────────────
  
  export async function getQuizQuestion(id) {
    const question = await findQuizQuestion(id);
    if (!question) throw new Error('Quiz question not found');
    return question;
  }
  
  export async function getQuizQuestions(args) {
    return findQuizQuestions(args);
  }
  
  export async function getQuizQuestionsForLesson(lessonId) {
    return findAllQuizQuestionsByLesson(lessonId);
  }
  
  // ── Mutations ─────────────────────────────────────────────────────────────────
  
  export async function createQuizQuestionService(input) {
    const { lessonId, type, question, explanation, options, correct, blanks, order } = input;
  
    validateQuizInput({ type, question, options, correct, blanks });
  
    const resolvedOrder = await resolveOrder(lessonId, order);
  
    const payload = {
      lesson: lessonId,
      type,
      question: question.trim(),
      explanation: explanation?.trim() ?? null,
      order: resolvedOrder,
    };
  
    // Attach type-specific fields
    if (type === 'mcq' || type === 'multi_select' || type === 'drag_drop') {
      payload.options = options;
      payload.correct = correct;
    }
  
    if (type === 'fill_blank') {
      payload.blanks = blanks;
    }
  
    return createQuizQuestion(payload);
  }
  
  export async function updateQuizQuestionService(id, input) {
    const existing = await findQuizQuestion(id);
    if (!existing) throw new Error('Quiz question not found');
  
    const {
      type = existing.type,
      question = existing.question,
      explanation,
      options,
      correct,
      blanks,
      order,
    } = input;
  
    validateQuizInput({
      type,
      question,
      options: options ?? existing.options,
      correct: correct ?? existing.correct,
      blanks: blanks ?? existing.blanks,
    });
  
    const payload = {
      type,
      question: question.trim(),
    };
  
    // Only update explanation if explicitly provided
    if (explanation !== undefined) payload.explanation = explanation?.trim() ?? null;
    if (order !== undefined) payload.order = order;
  
    // Update type-specific fields
    if (type === 'mcq' || type === 'multi_select' || type === 'drag_drop') {
      if (options !== undefined) payload.options = options;
      if (correct !== undefined) payload.correct = correct;
      // Clear blanks if type changed away from fill_blank
      payload.blanks = undefined;
    }
  
    if (type === 'fill_blank') {
      if (blanks !== undefined) payload.blanks = blanks;
      // Clear options and correct if type changed to fill_blank
      payload.options = undefined;
      payload.correct = null;
    }
  
    const updated = await updateQuizQuestion(id, payload);
    if (!updated) throw new Error('Quiz question not found');
    return updated;
  }
  
  export async function deleteQuizQuestionService(id) {
    const existing = await findQuizQuestion(id);
    if (!existing) throw new Error('Quiz question not found');
  
    const deleted = await deleteQuizQuestion(id);
    if (!deleted) throw new Error('Failed to delete quiz question');
  
    return { success: true, message: 'Quiz question deleted successfully', id };
  }
  
  export async function reorderQuizQuestionService(id, order) {
    const updated = await updateQuizQuestion(id, { order });
    if (!updated) throw new Error('Quiz question not found');
    return updated;
  }
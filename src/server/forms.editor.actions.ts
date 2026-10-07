"use server";

import { revalidatePath } from "next/cache";
import { sql } from "../db";
import { getCurrentUser } from "../lib/auth";

export async function updateFormMetaAction(
  formId: string,
  data: {
    title?: string;
    description?: string;
    isStarred?: boolean;
    isQuiz?: boolean;
    isAcceptingResponses?: boolean;
    status?: "draft" | "published" | "closed";
    theme?: any;
    settings?: any;
    folderId?: string | null;
  }
) {
  const user = await getCurrentUser();

  const updates: string[] = [];
  const values: any[] = [formId, user.id];
  let paramIdx = 3;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIdx++}`);
    values.push(data.title.trim().slice(0, 150) || "Untitled form");
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    values.push(data.description);
  }
  if (data.isStarred !== undefined) {
    updates.push(`is_starred = $${paramIdx++}`);
    values.push(data.isStarred);
  }
  if (data.isQuiz !== undefined) {
    updates.push(`is_quiz = $${paramIdx++}`);
    values.push(data.isQuiz);
  }
  if (data.isAcceptingResponses !== undefined) {
    updates.push(`is_accepting_responses = $${paramIdx++}`);
    values.push(data.isAcceptingResponses);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIdx++}`);
    values.push(data.status);
  }
  if (data.theme !== undefined) {
    updates.push(`theme = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.theme));
  }
  if (data.settings !== undefined) {
    updates.push(`settings = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.settings));
  }
  if (data.folderId !== undefined) {
    updates.push(`folder_id = $${paramIdx++}`);
    values.push(data.folderId);
  }

  if (updates.length === 0) return { success: true };

  updates.push("updated_at = NOW()");

  try {
    await sql.query(
      `UPDATE forms
       SET ${updates.join(", ")}
       WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
      values
    );

    revalidatePath(`/forms/${formId}/edit`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update form meta:", error);
    return { success: false, error: "Database error" };
  }
}

export async function addQuestionAction(
  formId: string,
  sectionId: string,
  sortOrder: number
) {
  const user = await getCurrentUser();

  try {
    // Verify ownership
    const formCheck = await sql.query(
      `SELECT id FROM forms WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
      [formId, user.id]
    );
    if (formCheck.length === 0) return { success: false, error: "Not authorized" };

    // Shift existing questions down
    await sql.query(
      `UPDATE form_questions
       SET sort_order = sort_order + 1
       WHERE form_id = $1 AND sort_order >= $2`,
      [formId, sortOrder]
    );

    // Insert new question
    const qResult = await sql.query(
      `INSERT INTO form_questions (form_id, section_id, title, type, sort_order)
       VALUES ($1, $2, 'Untitled Question', 'multiple_choice', $3)
       RETURNING id, form_id as "formId", section_id as "sectionId", title, type,
                 is_required as "isRequired", sort_order as "sortOrder",
                 config, validation, points, answer_key as "answerKey", feedback`,
      [formId, sectionId, sortOrder]
    );
    const newQ = qResult[0] as any;

    // Insert default option
    const optResult = await sql.query(
      `INSERT INTO form_options (question_id, label, sort_order)
       VALUES ($1, 'Option 1', 0)
       RETURNING id, label, image_url as "imageUrl", sort_order as "sortOrder",
                 is_other as "isOther", target_section_id as "targetSectionId"`,
      [newQ.id]
    );

    await sql.query(`UPDATE forms SET updated_at = NOW() WHERE id = $1`, [formId]);

    revalidatePath(`/forms/${formId}/edit`);
    return {
      success: true,
      question: {
        ...newQ,
        options: optResult,
      },
    };
  } catch (error) {
    console.error("Failed to add question:", error);
    return { success: false, error: "Failed to add question" };
  }
}

export async function updateQuestionAction(
  questionId: string,
  data: {
    title?: string;
    description?: string | null;
    type?: string;
    isRequired?: boolean;
    sortOrder?: number;
    config?: any;
    validation?: any;
    points?: number;
    answerKey?: any;
    feedback?: any;
  }
) {
  const updates: string[] = [];
  const values: any[] = [questionId];
  let paramIdx = 2;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIdx++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    values.push(data.description);
  }
  if (data.type !== undefined) {
    updates.push(`type = $${paramIdx++}::question_type`);
    values.push(data.type);
  }
  if (data.isRequired !== undefined) {
    updates.push(`is_required = $${paramIdx++}`);
    values.push(data.isRequired);
  }
  if (data.sortOrder !== undefined) {
    updates.push(`sort_order = $${paramIdx++}`);
    values.push(data.sortOrder);
  }
  if (data.config !== undefined) {
    updates.push(`config = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.config));
  }
  if (data.validation !== undefined) {
    updates.push(`validation = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.validation));
  }
  if (data.points !== undefined) {
    updates.push(`points = $${paramIdx++}`);
    values.push(data.points);
  }
  if (data.answerKey !== undefined) {
    updates.push(`answer_key = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.answerKey));
  }
  if (data.feedback !== undefined) {
    updates.push(`feedback = $${paramIdx++}::jsonb`);
    values.push(JSON.stringify(data.feedback));
  }

  if (updates.length === 0) return { success: true };

  try {
    await sql.query(
      `UPDATE form_questions
       SET ${updates.join(", ")}
       WHERE id = $1`,
      values
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update question:", error);
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteQuestionAction(questionId: string) {
  try {
    // Parity Rule: check if responses exist. If so, mark archived. Else, delete.
    const respCheck = await sql.query(
      `SELECT COUNT(*)::int as count FROM response_answers WHERE question_id = $1`,
      [questionId]
    );
    const hasResponses = ((respCheck[0] as any)?.count || 0) > 0;

    if (hasResponses) {
      await sql.query(`UPDATE form_questions SET is_archived = true WHERE id = $1`, [questionId]);
    } else {
      await sql.query(`DELETE FROM form_questions WHERE id = $1`, [questionId]);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

export async function duplicateQuestionAction(questionId: string) {
  try {
    const qRows = await sql.query(
      `SELECT form_id, section_id, title, description, type, is_required,
              sort_order, config, validation, points, answer_key, feedback
       FROM form_questions
       WHERE id = $1`,
      [questionId]
    );

    if (qRows.length === 0) return { success: false, error: "Question not found" };
    const q = qRows[0] as any;

    // Shift questions after this
    await sql.query(
      `UPDATE form_questions
       SET sort_order = sort_order + 1
       WHERE form_id = $1 AND sort_order > $2`,
      [q.form_id, q.sort_order]
    );

    // Insert copy
    const copyResult = await sql.query(
      `INSERT INTO form_questions (
         form_id, section_id, title, description, type, is_required,
         sort_order, config, validation, points, answer_key, feedback
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11::jsonb, $12::jsonb)
       RETURNING id, form_id as "formId", section_id as "sectionId", title, description,
                 type, is_required as "isRequired", sort_order as "sortOrder",
                 config, validation, points, answer_key as "answerKey", feedback`,
      [
        q.form_id,
        q.section_id,
        q.title,
        q.description,
        q.type,
        q.is_required,
        q.sort_order + 1,
        JSON.stringify(q.config || {}),
        JSON.stringify(q.validation || {}),
        q.points || 0,
        JSON.stringify(q.answer_key || {}),
        JSON.stringify(q.feedback || {}),
      ]
    );
    const newQ = copyResult[0] as any;

    // Copy options
    const optRows = await sql.query(
      `SELECT label, image_url, sort_order, is_other, target_section_id
       FROM form_options
       WHERE question_id = $1
       ORDER BY sort_order ASC`,
      [questionId]
    );

    const newOptions: any[] = [];
    for (const opt of optRows as any[]) {
      const insOpt = await sql.query(
        `INSERT INTO form_options (question_id, label, image_url, sort_order, is_other, target_section_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, label, image_url as "imageUrl", sort_order as "sortOrder",
                   is_other as "isOther", target_section_id as "targetSectionId"`,
        [newQ.id, opt.label, opt.image_url, opt.sort_order, opt.is_other, opt.target_section_id]
      );
      newOptions.push(insOpt[0]);
    }

    revalidatePath(`/forms/${q.form_id}/edit`);
    return {
      success: true,
      question: {
        ...newQ,
        options: newOptions,
      },
    };
  } catch (error) {
    console.error("Failed to duplicate question:", error);
    return { success: false, error: "Failed to duplicate question" };
  }
}

export async function saveOptionsAction(
  questionId: string,
  options: {
    id?: string;
    label: string;
    imageUrl?: string | null;
    sortOrder: number;
    isOther?: boolean;
    targetSectionId?: string | null;
  }[]
) {
  try {
    // Delete options not in the incoming list
    const incomingIds = options.filter((o) => o.id).map((o) => o.id);
    if (incomingIds.length > 0) {
      await sql.query(
        `DELETE FROM form_options
         WHERE question_id = $1 AND NOT (id = ANY($2::uuid[]))`,
        [questionId, incomingIds]
      );
    } else {
      await sql.query(`DELETE FROM form_options WHERE question_id = $1`, [questionId]);
    }

    const savedOptions: any[] = [];
    for (const opt of options) {
      if (opt.id) {
        const updated = await sql.query(
          `UPDATE form_options
           SET label = $1, sort_order = $2, is_other = $3, target_section_id = $4
           WHERE id = $5 AND question_id = $6
           RETURNING id, label, image_url as "imageUrl", sort_order as "sortOrder",
                     is_other as "isOther", target_section_id as "targetSectionId"`,
          [opt.label, opt.sortOrder, opt.isOther ?? false, opt.targetSectionId ?? null, opt.id, questionId]
        );
        if (updated.length > 0) savedOptions.push(updated[0]);
      } else {
        const inserted = await sql.query(
          `INSERT INTO form_options (question_id, label, sort_order, is_other, target_section_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, label, image_url as "imageUrl", sort_order as "sortOrder",
                     is_other as "isOther", target_section_id as "targetSectionId"`,
          [questionId, opt.label, opt.sortOrder, opt.isOther ?? false, opt.targetSectionId ?? null]
        );
        savedOptions.push(inserted[0]);
      }
    }

    return { success: true, options: savedOptions };
  } catch (error) {
    console.error("Failed to save options:", error);
    return { success: false, error: "Failed to save options" };
  }
}

export async function addSectionAction(formId: string, sortOrder: number) {
  try {
    // Shift sections
    await sql.query(
      `UPDATE form_sections
       SET sort_order = sort_order + 1
       WHERE form_id = $1 AND sort_order >= $2`,
      [formId, sortOrder]
    );

    const result = await sql.query(
      `INSERT INTO form_sections (form_id, title, sort_order)
       VALUES ($1, 'Untitled Section', $2)
       RETURNING id, title, description, sort_order as "sortOrder",
                 after_section_action as "afterSectionAction", target_section_id as "targetSectionId"`,
      [formId, sortOrder]
    );

    return { success: true, section: result[0] };
  } catch (error) {
    console.error("Failed to add section:", error);
    return { success: false, error: "Failed to add section" };
  }
}

export async function updateSectionAction(
  sectionId: string,
  data: {
    title?: string;
    description?: string | null;
    afterSectionAction?: string;
    targetSectionId?: string | null;
  }
) {
  const updates: string[] = [];
  const values: any[] = [sectionId];
  let paramIdx = 2;

  if (data.title !== undefined) {
    updates.push(`title = $${paramIdx++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIdx++}`);
    values.push(data.description);
  }
  if (data.afterSectionAction !== undefined) {
    updates.push(`after_section_action = $${paramIdx++}`);
    values.push(data.afterSectionAction);
  }
  if (data.targetSectionId !== undefined) {
    updates.push(`target_section_id = $${paramIdx++}`);
    values.push(data.targetSectionId);
  }

  if (updates.length === 0) return { success: true };

  try {
    await sql.query(
      `UPDATE form_sections
       SET ${updates.join(", ")}
       WHERE id = $1`,
      values
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to update section:", error);
    return { success: false, error: "Failed to update section" };
  }
}

export async function deleteSectionAction(sectionId: string) {
  try {
    await sql.query(`DELETE FROM form_sections WHERE id = $1`, [sectionId]);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete section:", error);
    return { success: false, error: "Failed to delete section" };
  }
}


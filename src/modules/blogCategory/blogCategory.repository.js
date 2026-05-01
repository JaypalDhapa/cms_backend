import BlogCategory from "./blogCategory.model.js";

export async function findAllCategories() {
  return BlogCategory.find().sort({ name: 1 }).lean();
}

export async function findCategory({ id, slug }) {
  if (!id && !slug) throw new Error("Provide id or slug");

  return BlogCategory.findOne({
    ...(id ? { _id: id } : { slug }),
  }).lean();
}

export async function createCategory(data) {
  const existing = await BlogCategory.findOne({
    $or: [{ name: data.name }, { slug: data.slug }],
  }).lean();

  if (existing) {
    if (existing.name === data.name) throw new Error("Category name already exists");
    if (existing.slug === data.slug) throw new Error("Category slug already exists");
  }

  return new BlogCategory(data).save();
}

export async function updateCategory(id, data) {
  // check duplicate name/slug if being changed
  if (data.name || data.slug) {
    const conflict = await BlogCategory.findOne({
      _id: { $ne: id },
      $or: [
        ...(data.name ? [{ name: data.name }] : []),
        ...(data.slug ? [{ slug: data.slug }] : []),
      ],
    }).lean();

    if (conflict) {
      if (conflict.name === data.name) throw new Error("Category name already exists");
      if (conflict.slug === data.slug) throw new Error("Category slug already exists");
    }
  }

  const updated = await BlogCategory.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) throw new Error("Category not found");
  return updated;
}

export async function deleteCategory(id) {
  const deleted = await BlogCategory.findByIdAndDelete(id).lean();
  if (!deleted) throw new Error("Category not found");
  return true;
}
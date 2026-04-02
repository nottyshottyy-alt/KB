import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { timestamps: true });

// Ensure subcategory slug is unique per category (or globally)
subCategorySchema.index({ slug: 1 }, { unique: true });

const SubCategory = mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);
export default SubCategory;

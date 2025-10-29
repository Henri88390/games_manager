import Joi from "joi";

// Combined schema for creating games (includes email + game data)
export const gameCreationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
  title: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Title is required and must be a non-empty string",
    "string.min": "Title is required and must be a non-empty string",
    "string.max": "Title must be less than 100 characters",
    "any.required": "Title is required and must be a non-empty string",
  }),
  rating: Joi.number().min(0).max(10).precision(1).required().messages({
    "number.min": "Rating must be between 0 and 10",
    "number.max": "Rating must be between 0 and 10",
    "number.precision": "Rating can have at most 1 decimal place",
    "any.required": "Rating is required",
  }),
  timespent: Joi.number().min(0).integer().required().messages({
    "number.min": "Time spent must be a non-negative integer",
    "number.integer": "Time spent must be a non-negative integer",
    "any.required": "Time spent is required",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Description must be less than 500 characters",
  }),
});

import { ForbiddenError } from "../utils/errors.js";

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole(["admin"]);

/**
 * Check if user is trainer
 */
export const requireTrainer = requireRole(["trainer"]);

/**
 * Check if user is trainee
 */
export const requireTrainee = requireRole(["trainee"]);

/**
 * Check if user is trainer or admin
 */
export const requireTrainerOrAdmin = requireRole(["trainer", "admin"]);

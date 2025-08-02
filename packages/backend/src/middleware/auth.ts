import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel, User, UserProgress } from "../models/User";
import { config } from "../config";

export interface AuthRequest extends Request {
  user: User & {
    progress?: UserProgress;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "auth_required",
        message: "Please log in to access this resource",
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
      };
      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          error: "User not found",
          code: "user_not_found",
          message: "Your account could not be found. Please log in again.",
        });
      }

      (req as AuthRequest).user = user;
      next();
    } catch (jwtError) {
      // Check for specific JWT errors to provide more helpful messages
      if ((jwtError as any).name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          code: "token_expired",
          message: "Your session has expired. Please log in again.",
        });
      } else if ((jwtError as any).name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Invalid token",
          code: "invalid_token",
          message: "Your session is invalid. Please log in again.",
        });
      }

      // Generic JWT error
      return res.status(401).json({
        error: "Invalid token",
        code: "auth_failed",
        message: "Authentication failed. Please log in again.",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      error: "Authentication failed",
      code: "auth_error",
      message: "An error occurred during authentication. Please log in again.",
    });
  }
};

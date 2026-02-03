const adminMiddleware = (req, res, next) => {
    console.log("Admin Middleware User:", req.user);
    console.log("Admin Middleware Role:", req.user ? req.user.role : "No user");
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
    next();
  };
  
  export default adminMiddleware;
  
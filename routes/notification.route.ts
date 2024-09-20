import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import { getNotifications  } from "../controllers/notificatioin.controller"
// updateNotification
import { updateAccessToken } from "../controllers/user.controller"

const notificationRoute = express.Router()

notificationRoute.get("/get-all-notifications", isAuthenticated, authorizeRoles("admin"), getNotifications)
notificationRoute.put("/update-notification/:id", updateAccessToken, isAuthenticated, authorizeRoles("admin"), updateNotification)

export default notificationRoute
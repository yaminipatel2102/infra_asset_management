"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const assetRoutes_1 = __importDefault(require("./routes/assetRoutes"));
const inspectionRoutes_1 = __importDefault(require("./routes/inspectionRoutes"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// API Routes
app.use('/api/assets', assetRoutes_1.default);
app.use('/api/inspections', inspectionRoutes_1.default);
app.use('/api/maintenance', maintenanceRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        system: 'R&B Asset Lifecycle Management System',
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 R&B Asset Management Backend running on port ${PORT}`);
    console.log(`=======================================================`);
});

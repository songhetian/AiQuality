"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityModule = void 0;
const common_1 = require("@nestjs/common");
const quality_service_1 = require("./quality.service");
const quality_controller_1 = require("./quality.controller");
const ai_integration_service_1 = require("../ai/ai-integration.service");
const socket_module_1 = require("../socket/socket.module");
const bull_1 = require("@nestjs/bull");
const quality_processor_1 = require("./quality.processor");
const tag_matching_service_1 = require("../tag/tag-matching.service");
let QualityModule = class QualityModule {
};
exports.QualityModule = QualityModule;
exports.QualityModule = QualityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => socket_module_1.SocketModule),
            bull_1.BullModule.registerQueue({
                name: 'quality-queue',
            }),
        ],
        providers: [
            quality_service_1.QualityService,
            ai_integration_service_1.AiIntegrationService,
            quality_processor_1.QualityProcessor,
            tag_matching_service_1.TagMatchingService,
        ],
        controllers: [quality_controller_1.QualityController],
        exports: [quality_service_1.QualityService],
    })
], QualityModule);
//# sourceMappingURL=quality.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterModule = void 0;
const common_1 = require("@nestjs/common");
const adapter_service_1 = require("./adapter.service");
const adapter_controller_1 = require("./adapter.controller");
const keyword_module_1 = require("../keyword/keyword.module");
let AdapterModule = class AdapterModule {
};
exports.AdapterModule = AdapterModule;
exports.AdapterModule = AdapterModule = __decorate([
    (0, common_1.Module)({
        imports: [keyword_module_1.KeywordModule],
        providers: [adapter_service_1.AdapterService],
        controllers: [adapter_controller_1.AdapterController],
    })
], AdapterModule);
//# sourceMappingURL=adapter.module.js.map
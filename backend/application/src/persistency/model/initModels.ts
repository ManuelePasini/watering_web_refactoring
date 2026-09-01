import initUser from './UserModel.js';
import initCompany from './CompanyModel.js';
import initOrganization from './OrganizationModel.js';
import initFarm from './FarmModel.js';
import initThesis from './ThesisModel.js';
import initWateringAlgorithmParams from './WateringAlgorithmParamsModel.js';
import initPermit from './PermitModel.js';
import initSector from './SectorModel.js';
import initThesisInSector from './ThesisInSectorModel.js';
import initDevice from './DeviceModel.js';
import initSignal from './SignalModel.js';
import initDeviceInFarm from './DeviceInFarmModel.js';
import initDeviceInSector from './DeviceInSectorModel.js';
import initDeviceInThesis from './DeviceInThesisModel.js';
import initMeasurement from './MeasurementModel.js';
import initThesesAllSignals from './ThesesAllSignalsModel.js';
import initAdvice from './AdviceModel.js';
import initWateringEvent from './WateringEventModel.js';
import initGridOptimalProfileAssignment from './GridOptimalProfileAssignmentModel.js';
import initOptimalProfile from './OptimalProfileModel.js';
import initUserAction from './UserActionModel.js';
import initProvider from './ProviderModel.js';
import initDevicesSignals from './DevicesSignalsModel.js';
import initSignalsDenormalized from './SignalsDenormalizedModel.js';
import initCompaniesOrganizations from './CompaniesOrganizationsModel.js';
import initService from './ServiceModel.js';
import initSectorServices from './SectorServicesModel.js';
import initSignalType from './SignalTypeModel.js';


export default function initModels(sequelize) {
  const models = {
    User: initUser(sequelize),
    Company: initCompany(sequelize),
    CompaniesOrganizations: initCompaniesOrganizations(sequelize),
    Organization: initOrganization(sequelize),
    Farm: initFarm(sequelize),
    Sector: initSector(sequelize),
    Thesis: initThesis(sequelize),
    Permit: initPermit(sequelize),
    ThesisInSector: initThesisInSector(sequelize),
    Device: initDevice(sequelize),
    DevicesSignals: initDevicesSignals(sequelize),
    Signal : initSignal(sequelize),
    SignalsDenormalized: initSignalsDenormalized(sequelize),
    DeviceInFarm : initDeviceInFarm(sequelize),
    DeviceInSector : initDeviceInSector(sequelize),
    DeviceInThesis : initDeviceInThesis(sequelize),
    Measurement : initMeasurement(sequelize),
    WateringAlgorithmParams: initWateringAlgorithmParams(sequelize),
    ThesesAllSignals: initThesesAllSignals(sequelize),
    Advice: initAdvice(sequelize),
    WateringEvent: initWateringEvent(sequelize),
    GridOptimalProfileAssignment : initGridOptimalProfileAssignment(sequelize),
    OptimalProfile: initOptimalProfile(sequelize),
    UserAction : initUserAction(sequelize),
    Provider : initProvider(sequelize),
    Service: initService(sequelize),
    SectorServices: initSectorServices(sequelize),
    SignalType: initSignalType(sequelize)
  };

  models.Company.hasMany(models.CompaniesOrganizations, { foreignKey: "companyId", as: "organizations" });
  models.CompaniesOrganizations.belongsTo(models.Company, {foreignKey: "companyId", as: "company"})
  models.Organization.hasMany(models.CompaniesOrganizations, { foreignKey: "organizationId" , as:  "companies"});
  models.CompaniesOrganizations.belongsTo(models.Organization, {foreignKey: "organizationId", as: "organization"})

  models.Farm.belongsTo(models.Company, { foreignKey: "companyId" , as: "company"});
  models.Company.hasMany(models.Farm, { foreignKey: "companyId" , as: "farms"});

  models.User.hasMany(models.Permit, {foreignKey: "userId", as: "permits" });
  models.Permit.belongsTo(models.User, {foreignKey: "userId", as: "user" });

  models.User.hasMany(models.UserAction, {foreignKey: "userId", as: "userActions" });
  models.UserAction.belongsTo(models.User, {foreignKey: "userId", as: "user" });

  models.Farm.hasMany(models.Sector, {foreignKey: "farmId", as: "sectors"});
  models.Sector.belongsTo(models.Farm, {foreignKey: "farmId", as: 'farm'});

  models.Thesis.hasMany(models.ThesisInSector, { foreignKey: "thesisId",  as: "thesisInSector"});
  models.ThesisInSector.belongsTo(models.Thesis, { foreignKey: "thesisId", as: "thesis" });

  models.Sector.hasMany(models.ThesisInSector, { foreignKey: "sectorId", as: "thesisInSector" });
  models.ThesisInSector.belongsTo(models.Sector, { foreignKey: "sectorId", as: "sector" });

  models.Provider.hasMany(models.Signal, {foreignKey: "providerId", as: "signals"});
  models.Signal.belongsTo(models.Provider, {foreignKey: "providerId", as: "provider"});

  models.Device.hasMany(models.DevicesSignals, {foreignKey: "deviceId", as: "signals"});
  models.DevicesSignals.belongsTo(models.Device, {foreignKey: "deviceId", as: "device"});
  models.Signal.hasMany(models.DevicesSignals, {foreignKey: "signalId", as: "devices"});
  models.DevicesSignals.belongsTo(models.Signal, {foreignKey: "signalId", as: "signal"});

  models.Farm.hasMany(models.DeviceInFarm, {foreignKey: "farmId", as: "signals"});
  models.DeviceInFarm.belongsTo(models.Farm, {foreignKey: "farmId", as: "farm"});
  models.Device.hasMany(models.DeviceInFarm, {foreignKey: "deviceId", as: "signalsInFarm"});
  models.DeviceInFarm.belongsTo(models.Device, {foreignKey: "deviceId", as: "device"});

  models.Sector.hasMany(models.DeviceInSector, {foreignKey: "sectorId", as: "signals"});
  models.DeviceInSector.belongsTo(models.Sector, {foreignKey: "sectorId", as: "sector"});
  models.Device.hasMany(models.DeviceInSector, {foreignKey: "deviceId", as: "signalsInSectors"});
  models.DeviceInSector.belongsTo(models.Device, {foreignKey: "deviceId", as: "device"});

  models.Thesis.hasMany(models.DeviceInThesis, {foreignKey: "thesisId", as: "signals"});
  models.DeviceInThesis.belongsTo(models.Thesis, {foreignKey: "thesisId", as: "thesis"});
  models.Device.hasMany(models.DeviceInThesis, {foreignKey: "deviceId", as: "signalsInTheses"});
  models.DeviceInThesis.belongsTo(models.Device, {foreignKey: "deviceId", as: "device"});

  models.Signal.hasMany(models.Measurement, {foreignKey: "signalId", as: "measurements"});
  models.Measurement.belongsTo(models.Signal, {foreignKey: "signalId", as: "signal"});

  models.Thesis.hasMany(models.Advice, {foreignKey: "thesisId", as: "advices"})
  models.Advice.belongsTo(models.Thesis, {foreignKey: "thesisId", as: "thesis"})
  
  models.Thesis.hasMany(models.WateringAlgorithmParams, {foreignKey: "thesisId", as: "algorithmParams"})
  models.WateringAlgorithmParams.belongsTo(models.Thesis, {foreignKey: "thesisId", as: "thesis"})

  models.GridOptimalProfileAssignment.belongsTo(models.Device, {foreignKey: "gridId", as: "device" })
  models.Device.hasMany(models.GridOptimalProfileAssignment,{foreignKey: "gridId", as: "gridOptimalProfileAssignments" })

  models.Sector.hasMany(models.SectorServices, {foreignKey: "sectorId", as: "services"});
  models.SectorServices.belongsTo(models.Sector, {foreignKey: "sectorId", as: "sector"});
  models.Service.hasMany(models.SectorServices, {foreignKey: "serviceId", as: "serviceSectors"});
  models.SectorServices.belongsTo(models.Service, {foreignKey: "serviceId", as: "service"});

  return models;
}

"use strict";

const { Gateway, SchoolGateway } = require("../../db/models");
const { ValidationError, NotFoundError } = require("../../utils/applicationErrors");
const { success, failure } = require("../../utils/serviceResult");

const listPlatformGateways = async () => {
  try {
    const [gateways, schoolRows] = await Promise.all([
      Gateway.find({}).sort({ name: 1 }).lean(),
      SchoolGateway.find({})
        .select("school_id gateway_id isEnabled credentialsConfigured configurationStatus validationStatus environment updatedAt")
        .populate("school_id", "school_name")
        .lean(),
    ]);
    return success(gateways.map((gateway) => ({
      ...gateway,
      schools: schoolRows.filter((row) => String(row.gateway_id) === String(gateway._id)),
    })));
  } catch (error) {
    return failure(error);
  }
};

const setPlatformGatewayEnabled = async (code, enabled) => {
  try {
    if (typeof enabled !== "boolean") throw new ValidationError("enabled must be a boolean");
    if (enabled && await Gateway.exists({ code, integrationStatus: { $ne: "implemented" } })) {
      throw new ValidationError("A provider cannot be enabled before its payment integration is implemented");
    }
    const gateway = await Gateway.findOneAndUpdate(
      { code },
      { $set: { isEnabled: enabled } },
      { new: true, runValidators: true },
    ).lean();
    if (!gateway) throw new NotFoundError("Payment gateway");
    return success(gateway);
  } catch (error) {
    return failure(error);
  }
};

module.exports = { listPlatformGateways, setPlatformGatewayEnabled };

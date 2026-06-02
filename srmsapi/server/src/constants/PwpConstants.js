/**
 * PWP Constants - Configuration for system entities
 * Image entities and related metadata
 */

const PwpConstants = {
  // Image Entity Types and Configurations
  Image_ENTITIES: {
    STUDENT: {
      type: 'STUDENT',
      folder: 'students',
      maxSize: 5242880, // 5MB in bytes
      allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      description: 'Student Profile Image'
    },
    SCHOOL_LOGO: {
      type: 'SCHOOL_LOGO',
      folder: 'school',
      maxSize: 2097152, // 2MB in bytes
      allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      description: 'School Logo'
    },
    DOCUMENT: {
      type: 'DOCUMENT',
      folder: 'documents',
      maxSize: 10485760, // 10MB in bytes
      allowedMimes: ['image/jpeg', 'image/png', 'application/pdf'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      description: 'Document Image'
    },
    CERTIFICATE: {
      type: 'CERTIFICATE',
      folder: 'certificates',
      maxSize: 5242880, // 5MB in bytes
      allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      description: 'Certificate Image'
    },
    MARKSHEET_TEMPLATE: {
      type: 'MARKSHEET_TEMPLATE',
      folder: 'templates',
      maxSize: 2097152, // 2MB in bytes
      allowedMimes: ['image/jpeg', 'image/png'],
      allowedExtensions: ['jpg', 'jpeg', 'png'],
      description: 'Marksheet Template Image'
    }
  },

  // Image Status
  IMAGE_STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DELETED: 'deleted'
  },

  // Image Upload Paths
  IMAGE_PATHS: {
    BASE: 'uploads',
    STUDENTS: 'uploads/students',
    SCHOOL: 'uploads/school',
    DOCUMENTS: 'uploads/documents',
    CERTIFICATES: 'uploads/certificates',
    TEMPLATES: 'uploads/templates'
  },

  // Utility Functions
  getImageEntity: (type) => {
    return PwpConstants.Image_ENTITIES[type] || null;
  },

  isValidImageType: (type) => {
    return Object.keys(PwpConstants.Image_ENTITIES).includes(type);
  },

  isValidMimeType: (type, mimeType) => {
    const entity = PwpConstants.Image_ENTITIES[type];
    return entity && entity.allowedMimes.includes(mimeType);
  },

  isValidExtension: (type, extension) => {
    const entity = PwpConstants.Image_ENTITIES[type];
    return entity && entity.allowedExtensions.includes(extension.toLowerCase());
  },

  isValidFileSize: (type, sizeInBytes) => {
    const entity = PwpConstants.Image_ENTITIES[type];
    return entity && sizeInBytes <= entity.maxSize;
  },

  getImagePath: (type) => {
    const entity = PwpConstants.Image_ENTITIES[type];
    return entity ? `${PwpConstants.IMAGE_PATHS.BASE}/${entity.folder}` : null;
  }
};

module.exports = PwpConstants;

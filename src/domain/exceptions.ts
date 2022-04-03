/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */

export class DomainException extends Error {}

export class CaptureOptionsNotPreparedException extends DomainException {}

export class InvalidCaptureStatusException extends DomainException {}

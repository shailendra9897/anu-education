export type DemoStudentDetails = {
  name?: string;
  phone?: string;
  email?: string;
};

export type MissingDemoDetails = {
  name: boolean;
  phone: boolean;
  email: boolean;
};

export function getMissingDemoDetails(
  details: DemoStudentDetails,
): MissingDemoDetails {
  return {
    name: !details.name?.trim(),
    phone: !details.phone?.trim(),
    email: !details.email?.trim(),
  };
}

export function hasRequiredDemoDetails(
  details: DemoStudentDetails,
): boolean {
  return Boolean(
    details.name?.trim() &&
    details.phone?.trim() &&
    details.email?.trim(),
  );
}
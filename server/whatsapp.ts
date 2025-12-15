import { WhatsAppTemplate, type JobStage } from './models';

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  console.log(`[WhatsApp] Sending message to ${phone}: ${message}`);
  return true;
}

export async function sendStageUpdateMessage(phone: string, stage: JobStage, vehicleName: string, plateNumber: string): Promise<boolean> {
  try {
    const template = await WhatsAppTemplate.findOne({ stage, isActive: true });
    
    if (!template) {
      console.log(`[WhatsApp] No active template found for stage: ${stage}`);
      return false;
    }

    const message = template.message
      .replace('{{vehicle}}', vehicleName)
      .replace('{{plate}}', plateNumber);

    return sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('[WhatsApp] Error sending stage update:', error);
    return false;
  }
}

export async function initializeWhatsAppTemplates(): Promise<void> {
  const defaultTemplates = [
    { stage: 'New Lead' as JobStage, message: 'Welcome! Your {{vehicle}} ({{plate}}) has been registered. We will contact you shortly.' },
    { stage: 'Inspection Done' as JobStage, message: 'Inspection completed for your {{vehicle}} ({{plate}}). Our team will share the report soon.' },
    { stage: 'Work In Progress' as JobStage, message: 'Work has started on your {{vehicle}} ({{plate}}). We will keep you updated.' },
    { stage: 'Ready for Delivery' as JobStage, message: 'Great news! Your {{vehicle}} ({{plate}}) is ready for pickup. Please visit us at your convenience.' },
    { stage: 'Completed' as JobStage, message: 'Thank you for choosing us! Service completed for your {{vehicle}} ({{plate}}). We hope to see you again!' },
    { stage: 'Cancelled' as JobStage, message: 'Your service request for {{vehicle}} ({{plate}}) has been cancelled. Contact us for any queries.' }
  ];

  for (const template of defaultTemplates) {
    await WhatsAppTemplate.findOneAndUpdate(
      { stage: template.stage },
      template,
      { upsert: true }
    );
  }
  
  console.log('[WhatsApp] Templates initialized');
}

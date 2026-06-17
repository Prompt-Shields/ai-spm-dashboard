export interface ExamplePrompt { label: string; text: string }

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    label: 'Insurance claim',
    text: 'I am investigating an insurance claim for our client, Michael Roberts, who is 42 years old and resides at 456 Elm Street, Los Angeles, CA. He filed a claim for property damage caused by a fire at his residence on 12/10/2023. The insurance policy covers up to $500,000, but the insurer is disputing the claim due to potential negligence. Could you provide insights on how to assess liability in this situation?',
  },
  {
    label: 'Payment reminder email',
    text: 'Draft a payment-reminder email to Sarah Chen at sarah.chen@acme.com — her invoice tied to card 4111 1111 1111 1111 is overdue.',
  },
  {
    label: 'Support ticket',
    text: 'Customer John Doe called from +1 (415) 555-0142 about his account; his SSN is 123-45-6789 and he wants a refund.',
  },
  {
    label: 'Debugging an integration',
    text: 'Our integration uses API key sk-proj-abc123XYZ456def789 and the server at 192.168.1.42 keeps timing out — can you debug?',
  },
]

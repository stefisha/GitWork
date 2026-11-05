/**
 * Discord webhook service for bounty notifications
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a message to Discord
 */
async function sendDiscordMessage(content, embeds = []) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  Discord webhook not configured - skipping notification');
    return;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        embeds,
        username: 'GitWork Bot',
        avatar_url: 'https://gitwork.io/favicon.png'
      })
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    console.log('✅ Discord notification sent');
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error.message);
  }
}

/**
 * Notify when a new bounty is created
 */
export async function notifyBountyCreated(bounty) {
  const embed = {
    title: '🎯 New Bounty Created!',
    color: 0x8B5CF6, // Purple
    fields: [
      {
        name: '📦 Repository',
        value: `${bounty.github_repo_owner}/${bounty.github_repo_name}`,
        inline: true
      },
      {
        name: '🔢 Issue',
        value: `#${bounty.github_issue_number}`,
        inline: true
      },
      {
        name: '💰 Amount',
        value: `${bounty.bounty_amount} ${bounty.currency}`,
        inline: true
      },
      {
        name: '📊 Status',
        value: '⏳ Waiting for deposit',
        inline: false
      }
    ],
    url: `https://github.com/${bounty.github_repo_owner}/${bounty.github_repo_name}/issues/${bounty.github_issue_number}`,
    timestamp: new Date().toISOString()
  };

  await sendDiscordMessage('', [embed]);
}

/**
 * Notify when a bounty is funded
 */
export async function notifyBountyFunded(bounty) {
  const embed = {
    title: '🎯 New Bounty Created - Take a Look!',
    color: 0x10b981, // Green
    description: '💰 A new bounty has been funded and is ready for contributors!',
    fields: [
      {
        name: '📦 Repository',
        value: `${bounty.github_repo_owner}/${bounty.github_repo_name}`,
        inline: true
      },
      {
        name: '🔢 Issue',
        value: `#${bounty.github_issue_number}`,
        inline: true
      },
      {
        name: '💰 Amount',
        value: `${bounty.bounty_amount} ${bounty.currency}`,
        inline: true
      },
      {
        name: '📊 Status',
        value: '🟢 Active - Ready for contributors!',
        inline: false
      },
      {
        name: '🔗 Links',
        value: `[View Issue](https://github.com/${bounty.github_repo_owner}/${bounty.github_repo_name}/issues/${bounty.github_issue_number}) • [Find on GitWork](https://gitwork.io)`,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };

  await sendDiscordMessage('', [embed]);
}

/**
 * Notify when a PR is merged and bounty is ready to claim
 */
export async function notifyBountyReadyToClaim(bounty) {
  const embed = {
    title: '🎉 Bounty Ready to Claim!',
    color: 0xf59e0b, // Orange
    fields: [
      {
        name: '📦 Repository',
        value: `${bounty.github_repo_owner}/${bounty.github_repo_name}`,
        inline: true
      },
      {
        name: '🔢 Issue',
        value: `#${bounty.github_issue_number}`,
        inline: true
      },
      {
        name: '💰 Amount',
        value: `${bounty.bounty_amount} ${bounty.currency}`,
        inline: true
      },
      {
        name: '👨‍💻 Contributor',
        value: `@${bounty.contributor_github_username}`,
        inline: true
      },
      {
        name: '📊 Status',
        value: '🎁 PR merged - waiting for claim',
        inline: false
      },
      {
        name: '🔗 Links',
        value: `[View Issue](https://github.com/${bounty.github_repo_owner}/${bounty.github_repo_name}/issues/${bounty.github_issue_number})`,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };

  await sendDiscordMessage('', [embed]);
}

/**
 * Notify when a bounty is claimed
 */
export async function notifyBountyClaimed(bounty, transactionSignature) {
  const embed = {
    title: '💸 Bounty Claimed!',
    color: 0x10b981, // Green
    fields: [
      {
        name: '📦 Repository',
        value: `${bounty.github_repo_owner}/${bounty.github_repo_name}`,
        inline: true
      },
      {
        name: '🔢 Issue',
        value: `#${bounty.github_issue_number}`,
        inline: true
      },
      {
        name: '💰 Amount',
        value: `${bounty.bounty_amount} ${bounty.currency}`,
        inline: true
      },
      {
        name: '👨‍💻 Claimed by',
        value: `@${bounty.contributor_github_username}`,
        inline: true
      },
      {
        name: '📊 Status',
        value: '✅ Payment sent!',
        inline: false
      },
      {
        name: '🔗 Transaction',
        value: `[View on Solana Explorer](https://explorer.solana.com/tx/${transactionSignature})`,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };

  await sendDiscordMessage('', [embed]);
}

/**
 * Notify when a bounty is cancelled
 */
export async function notifyBountyCancelled(bounty) {
  const embed = {
    title: '❌ Bounty Cancelled',
    color: 0xef4444, // Red
    fields: [
      {
        name: '📦 Repository',
        value: `${bounty.github_repo_owner}/${bounty.github_repo_name}`,
        inline: true
      },
      {
        name: '🔢 Issue',
        value: `#${bounty.github_issue_number}`,
        inline: true
      },
      {
        name: '💰 Amount',
        value: `${bounty.bounty_amount} ${bounty.currency}`,
        inline: true
      },
      {
        name: '📊 Status',
        value: bounty.deposit_confirmed_at ? '💵 Refunded' : '🚫 Cancelled before funding',
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };

  await sendDiscordMessage('', [embed]);
}

export default {
  notifyBountyFunded
  // Only notify when bounty is funded - keeps Discord clean and focused
};



export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) {
      return "just now";
    }
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    }
    if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
    }
    if (diffDay === 1) {
      return "yesterday";
    }
    if (diffDay < 7) {
      return `${diffDay} days ago`;
    }
    if (diffWeek === 1) {
      return "1 week ago";
    }
    if (diffWeek < 4) {
      return `${diffWeek} weeks ago`;
    }
    if (diffMonth === 1) {
      return "1 month ago";
    }
    return `${diffMonth} months ago`;
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

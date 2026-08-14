export const getUpdateWindowHtml = (): string => `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      :root {
        --background: #ffffff;
        --title: #111111;
        --subtitle: #838383;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --background: #111111;
          --title: #ffffff;
        }
      }
      body {
        background: var(--background);
        color: var(--title);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        overflow: hidden;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      .subtext {
        font-size: 14px;
        color: var(--subtitle);
        margin-top: 4px;
      }
      .spinner {
        margin-top: 20px;
        width: 24px;
        height: 24px;
        border: 3px solid var(--subtitle);
        border-top: 3px solid var(--title);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="title">Copyflow</div>
    <div class="subtext">Update system...</div>
    <div class="spinner"></div>
  </body>
</html>
`;

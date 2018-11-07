const { BrowserWindow } = require('electron');
const { checkForUpdates } = require('./../updater');
const { quit } = require('./mailbox');
const composerWindowManager = require('./composer');
const globalManager = require('./../globalManager');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Email',
        click: function() {
          composerWindowManager.openNewComposer();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: 'Developer',
        type: 'submenu',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            accelerator:
              process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
          }
        ]
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: 'Criptext',
    submenu: [
      {
        label: 'About Criptext',
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide Criptext',
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          quit();
        }
      }
    ]
  });
  // Criptext menu - updater
  if (!globalManager.isMAS.get()) {
    template[0].submenu.splice(1, 0, {
      label: 'Check for Updates...',
      click: checkForUpdates
    });
  }

  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    },
    {
      type: 'separator'
    },
    {
      label: 'Criptext',
      click: function() {
        showWindows();
      }
    }
  );
} else {
  // File menu.
  template[0].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Check for Updates...',
      click: checkForUpdates
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      accelerator: 'Alt+F4',
      click: function() {
        quit();
      }
    }
  );
}

const showWindows = () => {
  const visibleWindows = BrowserWindow.getAllWindows();
  visibleWindows.reverse().forEach(w => {
    w.show();
  });
};

module.exports = {
  template,
  showWindows
};

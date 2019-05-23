
# Module 6 group Creative Portion Description

## Emojis
Not only can the users send regular messages, users can also use emojis to communicate. This is implemented by using a jquery plugin called EmojiOne from CDNJS on GitHub.

Source: https://cdnjs.com/libraries/emojionearea

## Usability Enhancement
For better user experience and to really put effort and develop the best minimum viable product, the site's user interaction features need to be extremely easy to use and follow. Below are some nitty gritty enhancements we implemented for best usage.

Mobile/Tablet Responsive - Our app works well on any devices. We utilized Bootstrap to create fine layouts for easy usage and quick navigations.

Active rooms - When a user enters room, the room button changes its background color to indicate the "active" room.

Kick and ban - Kick and Ban buttons only show when a user is in a room. If the creator of the room kicks out a person (not themselves), the user automatically disappears from the room and the kicked user is taken to the main lobby where all current users are displayed

Private messaging - Private messaging dialog is hidden unless a user clicks the private messaging button. Then it uses jquery animation to take the window to the dialog.

Security and Privacy - You can only private message someone if you enter your name. If you do not enter your name, no functionalities should work.


### Note: - If a user gets kicked/ban out of a room, that user returns to the main lobby displaying all the current users on the system. We implemented this feature to allow the user to 'private message' the "kicker" if needed.
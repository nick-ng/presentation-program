MY_SESSION=$(tmux list-sessions | grep "presentation")
if [[ ! $MY_SESSION ]]; then
		# create a new session and `-d`etach
		tmux new-session -d -s presentation
		tmux new-window
		tmux send "npm start"
fi
tmux attach-session -d -t presentation

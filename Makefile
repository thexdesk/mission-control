install:
	# install npm
	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	sudo apt install -y nodejs
	# install ruby
	sudo apt install -y ruby-full
	# install gulp packages
	npm install
	# install ruby packages
	bundle install

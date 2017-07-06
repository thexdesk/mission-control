require './structure'

Event.new '', 'Music! :music:'
Event.new '', 'Rocket! :rocket:'
Event.new '', 'Sat! :sat:'
Event.new '', 'Satellite! :satellite:'

puts Event.reddit_format
